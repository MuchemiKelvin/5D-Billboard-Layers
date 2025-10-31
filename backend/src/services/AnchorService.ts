import { prisma } from '../lib/database';
import { sha256Hex } from '../utils/hash';
import { verifyOnChainIntegrity } from './ChainService';

const toHexData = (text: string): string => {
  return '0x' + Buffer.from(text, 'utf8').toString('hex');
};

const rpc = async (method: string, params: any[]): Promise<any> => {
  const url = process.env.ETH_RPC_URL as string;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
  });
  const data: any = await res.json();
  if (data.error) throw new Error(data.error.message || 'RPC error');
  return data.result;
};

const trySendTransaction = async (dataHex: string): Promise<{ txHash?: string; error?: string }> => {
  try {
    const from = process.env.ETH_FROM;
    if (!from) return { error: 'ETH_FROM not configured for eth_sendTransaction' };
    const txParams = [{ from, to: from, value: '0x0', data: dataHex }];
    const txHash = await rpc('eth_sendTransaction', txParams);
    return { txHash };
  } catch (e) {
    return { error: (e as Error).message };
  }
};

export const batchAndAnchor = async (limit: number = 50) => {
  // Collect recent escrow logs not yet anchored
  const logs = await prisma.escrowLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  // Filter out ones already included in anchor items
  const candidates: { id: string; auditProofHash: string }[] = [];
  for (const l of logs) {
    const exists = await prisma.anchorItem.findFirst({ where: { escrowLogId: l.id } });
    if (!exists && l.auditProofHash) {
      candidates.push({ id: l.id, auditProofHash: l.auditProofHash });
    }
  }

  if (candidates.length === 0) {
    return { created: false, message: 'No new items to anchor' };
  }

  // Compute batch hash: sha256 of sorted hashes joined by newline
  const sorted = candidates.map(c => c.auditProofHash).sort();
  const payload = sorted.join('\n');
  const batchHash = sha256Hex(payload);

  // Try submit to chain by embedding in data field
  const { txHash, error } = await trySendTransaction(toHexData(batchHash));

  const anchor = await prisma.auditAnchor.create({
    data: {
      batchHash,
      txHash: txHash || null,
      status: txHash ? 'SENT' : 'FAILED',
      itemCount: candidates.length,
      items: {
        create: candidates.map(c => ({ escrowLogId: c.id, proofHash: c.auditProofHash }))
      }
    },
    include: { items: true }
  });

  // Try to fetch block number if sent
  let blockNumber: string | undefined;
  if (txHash) {
    const verify = await verifyOnChainIntegrity(txHash);
    if (verify.found && verify.transaction?.blockNumber) {
      blockNumber = verify.transaction.blockNumber;
      await prisma.auditAnchor.update({ where: { id: anchor.id }, data: { blockNumber, status: 'CONFIRMED' } });
    }
  }

  return { created: true, anchorId: anchor.id, batchHash, txHash, blockNumber, error };
};

export const getAnchorById = async (id: string) => {
  return prisma.auditAnchor.findUnique({ where: { id }, include: { items: true } });
};


