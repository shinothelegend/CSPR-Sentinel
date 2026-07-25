import { CONFIG, createX402Challenge, X402Challenge, X402PaymentProof } from '@cspr-sentinel/shared';

export class MockServiceServer {
  private serviceMap: Map<string, any>;
  private merchantPublicKey: string;

  constructor(merchantPublicKey: string) {
    this.merchantPublicKey = merchantPublicKey;
    this.serviceMap = new Map();

    CONFIG.MOCK_SERVICES.forEach((svc) => {
      this.serviceMap.set(svc.id, svc);
    });
  }

  public getServices() {
    return CONFIG.MOCK_SERVICES;
  }

  public handleServiceRequest(
    serviceId: string,
    proofHeader?: X402PaymentProof
  ): { status: number; challenge?: X402Challenge; payload?: any } {
    const svc = this.serviceMap.get(serviceId);
    if (!svc) {
      return { status: 404, payload: { error: 'Service not found' } };
    }

    // Gated check: If no payment proof provided, issue x402 Challenge
    if (!proofHeader || !proofHeader.txHash) {
      const challenge = createX402Challenge(
        svc.id,
        svc.name,
        svc.priceCspr,
        svc.priceMotes,
        this.merchantPublicKey
      );
      return { status: 402, challenge };
    }

    // Payment proof verified! Return 200 OK with dynamic service payload
    const payload = this.generatePayload(svc.id);
    return {
      status: 200,
      payload: {
        serviceId: svc.id,
        serviceName: svc.name,
        timestamp: Date.now(),
        txHash: proofHeader.txHash,
        data: payload,
      },
    };
  }

  private generatePayload(serviceId: string): any {
    switch (serviceId) {
      case 'hash-verifier':
        return {
          validatorNode: 'Casper Validator Node Alpha',
          blockHeight: 3128452 + Math.floor(Math.random() * 10),
          blockStateRootHash: '5c0e271...20cba',
          validationStatus: 'SUCCESS_INTEGRITY_VERIFIED',
          merkleTreeDepth: 14,
          checkedAt: Date.now(),
        };

      case 'mempool-threat':
        return {
          mempoolSize: 142 + Math.floor(Math.random() * 20),
          scanDepth: 50,
          threatLevel: 'LOW_NO_ANOMALY',
          checkedTransactions: 48,
          frontrunningAlerts: 0,
          suspiciousDeploys: [],
        };

      case 'node-security':
        return {
          validatorIp: '138.201.12.85',
          activePeers: 42,
          intrusionAlerts: 0,
          consensusState: 'SYNCED',
          cpuLoadPct: '12.4%',
          ramUsagePct: '42.8%',
          securityState: 'SECURE',
        };

      case 'contract-auditor':
        return {
          wasmAuditModel: 'Sentinel-Security-LLM-v2',
          vulnerabilitiesFound: 0,
          auditScore: '99/100',
          reentrancyCheck: 'PASSED',
          integerOverflowCheck: 'PASSED',
          privilegeEscalationCheck: 'PASSED',
          status: 'SECURE_DEPLOY_APPROVED',
        };

      default:
        return { message: 'Verification completed successfully' };
    }
  }
}
