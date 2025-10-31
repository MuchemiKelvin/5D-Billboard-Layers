                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { extractEmbeddedHashFromInput, getTransactionByHash } from '../services/ChainService';
import { ipAllowlistForRoles } from '../middleware/ipAllowlist';
import { encryptAES256GCM } from '../utils/crypto';
import { batchAndAnchor, getAnchorById } from '../services/AnchorService';

const router = express.Router();

// Restrict by IP for AUDITOR role if applicable
router.use(ipAllowlistForRoles(['AUDITOR']));

const requireAuth = (req: Request, res: Response, next: Function) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ success: false, message: 'Access token is required' });
      return;
    }
    jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key');
    return next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Unauthorized', error: (error as Error).message });
    return;
  }
};

/**
 * @route   POST /api/audit/validate
 * @desc    Validate local hashes against blockchain transaction data
 * @body    { txHash: string, expectedHash?: string, hashes?: string[], export?: boolean }
 * @access  Protected (token required), IP-allowlisted for AUDITOR
 */
router.post('/validate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { txHash, expectedHash, hashes, export: exportFlag } = req.body || {};
    if (!txHash || !/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
      return res.status(400).json({ success: false, message: 'txHash is required and must be a valid hash' });
    }

    const tx = await getTransactionByHash(txHash);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const onChainHash = extractEmbeddedHashFromInput(tx.input);
    const locals: string[] = Array.isArray(hashes) ? hashes : (expectedHash ? [expectedHash] : []);

    const comparisons = locals.map((h) => ({
      local: String(h || '').toLowerCase(),
      onChain: String(onChainHash || '').toLowerCase(),
      match: onChainHash ? String(h || '').toLowerCase() === String(onChainHash || '').toLowerCase() : false
    }));

    const result = {
      txHash,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      onChainHash,
      comparisons,
      allMatch: comparisons.length > 0 && comparisons.every((c) => c.match)
    };

    if (exportFlag) {
      const encrypted = encryptAES256GCM(JSON.stringify(result));
      return res.json({ success: true, message: 'Validation complete (encrypted export)', data: encrypted });
    }

    return res.json({ success: true, message: 'Validation complete', data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Validation failed', error: (error as Error).message });
  }
});

export default router;

// Anchoring endpoints
router.post('/anchor', requireAuth, async (req: Request, res: Response) => {
  try {
    const { limit } = req.body || {};
    const result = await batchAndAnchor(Number(limit) || 50);
    return res.json({ success: true, message: 'Anchoring executed', data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Anchoring failed', error: (error as Error).message });
  }
});

router.get('/anchors/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'Missing anchor id' });
    }
    const anchor = await getAnchorById(id);
    if (!anchor) return res.status(404).json({ success: false, message: 'Anchor not found' });
    return res.json({ success: true, message: 'Anchor retrieved', data: anchor });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Retrieval failed', error: (error as Error).message });
  }
});