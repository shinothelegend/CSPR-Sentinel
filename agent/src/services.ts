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
      case 'weather-oracle':
        return {
          location: 'Casper Testnet Node Alpha',
          temperatureCelsius: (18.5 + Math.random() * 4).toFixed(1),
          humidityPct: Math.floor(45 + Math.random() * 20),
          pressureHpa: 1013.25 + Math.floor(Math.random() * 10),
          solarRadiationWm2: Math.floor(600 + Math.random() * 200),
          uvIndex: 7.2,
          status: 'OPTIMAL_SENSING',
        };

      case 'market-data-feed':
        return {
          pair: 'CSPR/USD',
          priceUsd: (0.0345 + (Math.random() - 0.5) * 0.002).toFixed(6),
          volume24hUsd: 1420500 + Math.floor(Math.random() * 50000),
          liquidityDepthCspr: 8500000,
          spreadPct: 0.08,
          volatilityIndex30d: '14.2%',
          trending: Math.random() > 0.4 ? 'BULLISH' : 'NEUTRAL',
        };

      case 'ai-inference-endpoint':
        return {
          model: 'Sentinel-LLM-v3',
          promptTokens: 412,
          completionTokens: 128,
          confidenceScore: 0.984,
          sentiment: 'STRONG_POSITIVE_MOMENTUM',
          classification: 'HEALTHY_DECENTRALIZED_PAYMENT_FLOW',
          inferenceTimeMs: 142,
        };

      case 'storage-pin-service':
        return {
          cid: `QmX7z8${Math.random().toString(36).substring(2, 12)}a4B9c`,
          bytesPinned: 2048576,
          redundancyNodes: 12,
          pinStatus: 'PERMANENTLY_PINNED_CSPR_DAG',
          blockConfirmation: 1948210,
        };

      default:
        return { message: 'Data retrieved successfully' };
    }
  }
}
