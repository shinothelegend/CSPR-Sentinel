export type AgentStatus = 'idle' | 'evaluating' | 'paying' | 'settled' | 'blocked' | 'error';

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  priceCspr: number;
  priceMotes: string;
  endpoint: string;
  iconName: string;
}

export interface BudgetPolicy {
  maxPricePerRequestCspr: number;
  maxSpendPerHourCspr: number;
  autoApprove: boolean;
  paused: boolean;
}

export interface PaymentReceipt {
  id: string;
  serviceId: string;
  serviceName: string;
  payerPublicKey: string;
  amountCspr: number;
  amountMotes: string;
  txHash: string;
  receiptHash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  onChainVerified: boolean;
  onChainIndex?: number;
  responsePayload?: any;
}

export interface AgentState {
  status: AgentStatus;
  publicKey: string;
  balanceCspr: number;
  totalSpentCspr: number;
  hourlySpentCspr: number;
  policy: BudgetPolicy;
  activeServiceId?: string;
  lastPayment?: PaymentReceipt;
  history: PaymentReceipt[];
}

export interface X402Challenge {
  status: 402;
  protocol: 'x402';
  version: '1.0';
  serviceId: string;
  serviceName: string;
  priceCspr: number;
  priceMotes: string;
  recipientPublicKey: string;
  paymentUrl: string;
  nonce: string;
  timestamp: number;
}

export interface X402PaymentProof {
  serviceId: string;
  txHash: string;
  payerPublicKey: string;
  amountMotes: string;
  nonce: string;
  signature?: string;
}

export interface ServerToClientEvents {
  agent_state: (state: AgentState) => void;
  payment_started: (receipt: Partial<PaymentReceipt>) => void;
  payment_settled: (receipt: PaymentReceipt) => void;
  policy_blocked: (data: { serviceId: string; reason: string; priceCspr: number }) => void;
}
