import { X402Challenge, X402PaymentProof } from './types';

export function createX402Challenge(
  serviceId: string,
  serviceName: string,
  priceCspr: number,
  priceMotes: string,
  recipientPublicKey: string
): X402Challenge {
  return {
    status: 402,
    protocol: 'x402',
    version: '1.0',
    serviceId,
    serviceName,
    priceCspr,
    priceMotes,
    recipientPublicKey,
    paymentUrl: `/api/x402/verify`,
    nonce: `x402_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
  };
}

export function parseX402Header(headerValue?: string): X402PaymentProof | null {
  if (!headerValue) return null;
  try {
    const jsonStr = Buffer.from(headerValue, 'base64').toString('utf-8');
    return JSON.parse(jsonStr) as X402PaymentProof;
  } catch (err) {
    return null;
  }
}

export function formatX402Header(proof: X402PaymentProof): string {
  return Buffer.from(JSON.stringify(proof)).toString('base64');
}
