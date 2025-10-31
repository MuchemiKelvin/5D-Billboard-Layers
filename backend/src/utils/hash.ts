import crypto from 'crypto';

export interface EscrowCanonicalInput {
  txUid: string;
  type: 'HOLD' | 'RELEASE';
  amount: string; // normalized two-decimal string
  currency: string; // uppercase ISO, e.g., KES
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  timestamp: string; // ISO 8601 UTC string
  mpesaRef: string; // empty string if unknown
}

export const normalizeAmount = (value: number | string): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  return num.toFixed(2);
};

export const canonicalizeEscrowFields = (input: {
  txUid: string;
  type: 'HOLD' | 'RELEASE';
  amount: number | string;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  timestamp: string | Date;
  mpesaRef?: string | null;
}): EscrowCanonicalInput => {
  return {
    txUid: String(input.txUid || '').toLowerCase(),
    type: input.type,
    amount: normalizeAmount(input.amount),
    currency: String(input.currency || '').toUpperCase(),
    status: input.status,
    timestamp: (input.timestamp instanceof Date ? input.timestamp.toISOString() : new Date(input.timestamp).toISOString()),
    mpesaRef: String(input.mpesaRef || '').toLowerCase()
  };
};

export const escrowCanonicalString = (c: EscrowCanonicalInput): string => {
  // Order: txUid, type, amount, currency, status, timestamp, mpesaRef
  return [c.txUid, c.type, c.amount, c.currency, c.status, c.timestamp, c.mpesaRef].join('\n');
};

export const sha256Hex = (data: string | Buffer): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

export const generateEscrowProofHash = (input: Parameters<typeof canonicalizeEscrowFields>[0]): string => {
  const canonical = canonicalizeEscrowFields(input);
  const payload = escrowCanonicalString(canonical);
  return sha256Hex(payload);
};




