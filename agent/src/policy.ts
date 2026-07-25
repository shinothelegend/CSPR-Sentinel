import { BudgetPolicy, PaymentReceipt } from '@cspr-sentinel/shared';

export class PolicyEngine {
  private policy: BudgetPolicy;

  constructor(initialPolicy?: Partial<BudgetPolicy>) {
    this.policy = {
      maxPricePerRequestCspr: 0.5,
      maxSpendPerHourCspr: 5.0,
      autoApprove: true,
      paused: false,
      ...initialPolicy,
    };
  }

  public getPolicy(): BudgetPolicy {
    return { ...this.policy };
  }

  public updatePolicy(newPolicy: Partial<BudgetPolicy>): BudgetPolicy {
    this.policy = { ...this.policy, ...newPolicy };
    console.log('⚙️ Updated Budget Policy:', this.policy);
    return this.getPolicy();
  }

  public calculateHourlySpend(history: PaymentReceipt[]): number {
    const oneHourAgo = Date.now() - 3600 * 1000;
    return history
      .filter((item) => item.timestamp >= oneHourAgo && item.status === 'confirmed')
      .reduce((sum, item) => sum + item.amountCspr, 0);
  }

  public evaluatePaymentRequest(
    serviceId: string,
    priceCspr: number,
    history: PaymentReceipt[]
  ): { allowed: boolean; reason?: string } {
    if (this.policy.paused) {
      return { allowed: false, reason: 'Agent payments are currently PAUSED by owner policy.' };
    }

    if (priceCspr > this.policy.maxPricePerRequestCspr) {
      return {
        allowed: false,
        reason: `Price ${priceCspr.toFixed(2)} CSPR exceeds max single request limit (${this.policy.maxPricePerRequestCspr.toFixed(2)} CSPR).`,
      };
    }

    const currentHourlySpend = this.calculateHourlySpend(history);
    if (currentHourlySpend + priceCspr > this.policy.maxSpendPerHourCspr) {
      return {
        allowed: false,
        reason: `Hourly spend (${currentHourlySpend.toFixed(2)} + ${priceCspr.toFixed(2)} CSPR) would exceed hourly cap (${this.policy.maxSpendPerHourCspr.toFixed(2)} CSPR).`,
      };
    }

    return { allowed: true };
  }
}
