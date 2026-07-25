import EventEmitter from 'events';
import {
  AgentState,
  AgentStatus,
  BudgetPolicy,
  CONFIG,
  PaymentReceipt,
  formatX402Header,
} from '@cspr-sentinel/shared';
import { CasperEngine } from './casper';
import { PolicyEngine } from './policy';
import { MockServiceServer } from './services';

export class SentinelAgent extends EventEmitter {
  private casperEngine: CasperEngine;
  private policyEngine: PolicyEngine;
  private mockServer: MockServiceServer;

  private status: AgentStatus = 'idle';
  private activeServiceId?: string;
  private history: PaymentReceipt[] = [];
  private totalSpentCspr: number = 0;

  private isRunning: boolean = false;
  private timerHandle?: NodeJS.Timeout;

  constructor() {
    super();
    this.casperEngine = new CasperEngine();
    this.policyEngine = new PolicyEngine();
    this.mockServer = new MockServiceServer(this.casperEngine.getPublicKeyHex());
  }

  public getPublicKey(): string {
    return this.casperEngine.getPublicKeyHex();
  }

  public async getState(): Promise<AgentState> {
    const balanceCspr = await this.casperEngine.getBalanceCspr();
    const hourlySpent = this.policyEngine.calculateHourlySpend(this.history);

    return {
      status: this.status,
      publicKey: this.getPublicKey(),
      balanceCspr,
      totalSpentCspr: this.totalSpentCspr,
      hourlySpentCspr: hourlySpent,
      policy: this.policyEngine.getPolicy(),
      activeServiceId: this.activeServiceId,
      lastPayment: this.history.length > 0 ? this.history[0] : undefined,
      history: this.history,
    };
  }

  public updatePolicy(newPolicy: Partial<BudgetPolicy>): BudgetPolicy {
    const updated = this.policyEngine.updatePolicy(newPolicy);
    this.emitState();
    return updated;
  }

  private async emitState() {
    const state = await this.getState();
    this.emit('state_update', state);
  }

  public startAutonomousLoop(intervalMs: number = 10000) {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🤖 CSPR Sentinel Autonomous AI Agent Active & Listening...');

    // Run first discovery immediately
    this.executeDiscoveryStep();

    this.timerHandle = setInterval(() => {
      this.executeDiscoveryStep();
    }, intervalMs);
  }

  public stopAutonomousLoop() {
    this.isRunning = false;
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
    }
    this.status = 'idle';
    this.emitState();
  }

  /**
   * Main Autonomous Workflow Step:
   * Discover Service -> Receive 402 -> Evaluate Policy -> Pay On-Chain -> Log Receipt -> Receive Data
   */
  public async executeDiscoveryStep(targetServiceId?: string) {
    const services = CONFIG.MOCK_SERVICES;
    const selectedSvc = targetServiceId
      ? services.find((s) => s.id === targetServiceId) || services[0]
      : services[Math.floor(Math.random() * services.length)];

    this.activeServiceId = selectedSvc.id;
    this.status = 'evaluating';
    await this.emitState();

    console.log(`\n🔍 Agent discovering service: [${selectedSvc.name}] (Price: ${selectedSvc.priceCspr} CSPR)`);

    // 1. Send unauthenticated request -> Receive 402 Payment Required challenge
    const challengeRes = this.mockServer.handleServiceRequest(selectedSvc.id);

    if (challengeRes.status === 402 && challengeRes.challenge) {
      const challenge = challengeRes.challenge;
      console.log(`🛑 Received x402 Payment Challenge from ${challenge.serviceName}: Price ${challenge.priceCspr} CSPR`);

      // 2. Evaluate against Budget Policy Engine
      const evalResult = this.policyEngine.evaluatePaymentRequest(
        selectedSvc.id,
        selectedSvc.priceCspr,
        this.history
      );

      if (!evalResult.allowed) {
        console.warn(`🚫 Payment Blocked by Policy Engine: ${evalResult.reason}`);
        this.status = 'blocked';
        this.emit('policy_blocked', {
          serviceId: selectedSvc.id,
          reason: evalResult.reason,
          priceCspr: selectedSvc.priceCspr,
        });
        await this.emitState();

        setTimeout(() => {
          this.status = 'idle';
          this.activeServiceId = undefined;
          this.emitState();
        }, 4000);
        return;
      }

      // 3. Policy Passed -> Proceed to Pay On-Chain in CSPR
      this.status = 'paying';
      await this.emitState();

      const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const pendingReceipt: PaymentReceipt = {
        id: receiptId,
        serviceId: selectedSvc.id,
        serviceName: selectedSvc.name,
        payerPublicKey: this.getPublicKey(),
        amountCspr: selectedSvc.priceCspr,
        amountMotes: selectedSvc.priceMotes,
        txHash: 'pending...',
        receiptHash: `hash-${receiptId}`,
        timestamp: Date.now(),
        status: 'pending',
        onChainVerified: false,
      };

      this.history.unshift(pendingReceipt);
      this.emit('payment_started', pendingReceipt);
      await this.emitState();

      // Execute real CSPR transfer deploy on testnet
      const transferRes = await this.casperEngine.sendPayment(
        challenge.recipientPublicKey,
        selectedSvc.priceMotes
      );

      // Notarize receipt to Casper Smart Contract dictionary
      const contractRes = await this.casperEngine.logPaymentOnChain(
        selectedSvc.id,
        selectedSvc.priceMotes,
        pendingReceipt.receiptHash,
        pendingReceipt.timestamp
      );

      // Update confirmed receipt
      pendingReceipt.txHash = transferRes.txHash;
      pendingReceipt.status = 'confirmed';
      pendingReceipt.onChainVerified = contractRes.onChainVerified;
      pendingReceipt.onChainIndex = this.history.length;

      // 4. Send x402 Payment Proof Header to retrieve paid content
      const proofHeader = {
        serviceId: selectedSvc.id,
        txHash: transferRes.txHash,
        payerPublicKey: this.getPublicKey(),
        amountMotes: selectedSvc.priceMotes,
        nonce: challenge.nonce,
      };

      const paidRes = this.mockServer.handleServiceRequest(selectedSvc.id, proofHeader);

      if (paidRes.status === 200) {
        pendingReceipt.responsePayload = paidRes.payload;
        this.totalSpentCspr += selectedSvc.priceCspr;
        this.status = 'settled';

        console.log(`✅ x402 Micropayment Settled On-Chain! Service Payload Delivered:`, paidRes.payload.data);
        this.emit('payment_settled', pendingReceipt);
        await this.emitState();
      }

      // Reset to idle state after presentation delay
      setTimeout(() => {
        this.status = 'idle';
        this.activeServiceId = undefined;
        this.emitState();
      }, 5000);
    }
  }

  public async getOnChainProofRecords() {
    return this.casperEngine.queryOnChainReceipts();
  }
}
