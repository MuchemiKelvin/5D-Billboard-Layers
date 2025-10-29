import { logger } from '../utils/logger';

export interface ChainTx {
  hash: string;
  blockNumber?: string;
  from?: string;
  to?: string;
  input?: string;
  value?: string;
}

export interface VerifyResult {
  found: boolean;
  network?: string;
  transaction?: ChainTx;
  error?: string;
}

const jsonRpc = async (method: string, params: any[]): Promise<any> => {
  const rpcUrl = process.env.ETH_RPC_URL;
  if (!rpcUrl) {
    throw new Error('ETH_RPC_URL is not configured');
  }

  const payload = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };

  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(`RPC error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'RPC returned error');
  }
  return data.result;
};

export const getTransactionByHash = async (txHash: string): Promise<ChainTx | null> => {
  try {
    const tx = await jsonRpc('eth_getTransactionByHash', [txHash]);
    if (!tx) return null;
    return tx as ChainTx;
  } catch (error) {
    logger.error('getTransactionByHash failed:', error as any);
    throw error;
  }
};

export const verifyOnChainIntegrity = async (txHash: string): Promise<VerifyResult> => {
  try {
    const tx = await getTransactionByHash(txHash);
    if (!tx) {
      return { found: false };
    }

    return {
      found: true,
      network: process.env.CHAIN_NETWORK || 'unknown',
      transaction: {
        hash: tx.hash,
        blockNumber: tx.blockNumber,
        from: tx.from,
        to: tx.to,
        input: tx.input,
        value: tx.value
      }
    };
  } catch (error) {
    return { found: false, error: (error as Error).message };
  }
};

export const extractEmbeddedHashFromInput = (input?: string): string | null => {
  if (!input) return null;
  try {
    // Heuristic: look for ASCII-encoded JSON or a hex-encoded hash appended in input data
    // Common pattern: input ends with 0x... or contains an UTF-8 string of a hash
    const cleaned = input.startsWith('0x') ? input.slice(2) : input;
    const bytes = cleaned.match(/.{1,2}/g)?.map((b) => parseInt(b, 16)) || [];
    const text = Buffer.from(bytes).toString('utf8');

    // Try JSON parse first
    try {
      const obj = JSON.parse(text);
      if (obj && typeof obj.auditHash === 'string') return obj.auditHash;
    } catch {}

    // Fallback: find a 64-hex or base64-ish token
    const hexMatch = text.match(/[a-fA-F0-9]{64}/);
    if (hexMatch) return hexMatch[0].toLowerCase();

    const base64Match = text.match(/[A-Za-z0-9+/]{43}=/);
    if (base64Match) return base64Match[0];

    return null;
  } catch {
    return null;
  }
};



