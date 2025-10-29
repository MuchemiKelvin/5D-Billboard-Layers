import express, { Request, Response } from 'express';
import { verifyOnChainIntegrity } from '../services/ChainService';
import { ipAllowlistForRoles } from '../middleware/ipAllowlist';

const router = express.Router();

// Restrict by IP for NOTARY role if applicable; admins/operators unaffected but must be authorized at higher layers if added
router.use(ipAllowlistForRoles(['NOTARY']));

/**
 * @route   GET /api/chain/verify/:txHash
 * @desc    Verify on-chain transaction and return integrity info
 * @access  Protected (token required), IP-allowlisted for NOTARY
 */
router.get('/verify/:txHash', async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;
    if (!/^0x([A-Fa-f0-9]{64})$/.test(txHash)) {
      return res.status(400).json({ success: false, message: 'Invalid txHash format' });
    }

    const result = await verifyOnChainIntegrity(txHash);
    if (!result.found) {
      return res.status(404).json({ success: false, message: 'Transaction not found', error: result.error });
    }

    return res.json({ success: true, message: 'On-chain integrity verified', data: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification failed', error: (error as Error).message });
  }
});

export default router;



