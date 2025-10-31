import express, { Request, Response } from 'express';
import { prisma } from '../lib/database';
import { generateEscrowProofHash } from '../utils/hash';
import { mpesaConfig } from '../utils/config';
import { initiateHold, b2bTransfer } from '../services/MpesaService';

const router = express.Router();

/**
 * @route   POST /api/escrow/hold
 * @desc    Create a HOLD escrow log (stub M-Pesa integration)
 * @body    { txUid: string, amount: number, currency?: string }
 * @access  Protected (JWT suggested in future); stubbed open for now
 */
router.post('/hold', async (req: Request, res: Response) => {
  try {
    const { txUid, amount, currency = 'KES', phoneNumber, accountReference, description } = req.body || {};
    if (!txUid || typeof amount !== 'number') {
      return res.status(400).json({ success: false, message: 'txUid and amount are required' });
    }
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: 'phoneNumber is required (format 2547XXXXXXXX)' });
    }

    const now = new Date();
    const proofHash = generateEscrowProofHash({
      txUid,
      type: 'HOLD',
      amount,
      currency,
      status: 'PENDING',
      timestamp: now,
      mpesaRef: ''
    });

    // Call real M-Pesa STK Push (sandbox)
    const stkResponse = await initiateHold({ amount, phoneNumber, accountReference, description });

    const created = await prisma.escrowLog.create({
      data: {
        txUid,
        type: 'HOLD',
        amount,
        currency,
        status: 'PENDING',
        requestedAt: now,
        auditProofHash: proofHash,
        requestMeta: { mpesa: { shortcode: mpesaConfig().shortcode }, stkPush: stkResponse }
      }
    });

    return res.status(201).json({ success: true, message: 'Escrow HOLD logged', data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create escrow hold', error: (error as Error).message });
  }
});

/**
 * @route   GET /api/escrow/:uid
 * @desc    Retrieve escrow log by txUid
 */
router.get('/:uid', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    if (!uid) {
      return res.status(400).json({ success: false, message: 'Missing required parameter: uid' });
    }
    const log = await prisma.escrowLog.findUnique({ where: { txUid: uid } });
    if (!log) return res.status(404).json({ success: false, message: 'Escrow not found' });
    return res.json({ success: true, message: 'Escrow retrieved', data: log });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve escrow', error: (error as Error).message });
  }
});

export default router;
/**
 * @route   POST /api/escrow/webhook/mpesa
 * @desc    Receive M-Pesa callback; update escrow status and regenerate proof hash
 */
router.post('/webhook/mpesa', async (req: Request, res: Response) => {
  try {
    // Support both our simple JSON and actual STK callback payload
    const body: any = req.body || {};
    let txUid: string | undefined = body.txUid;
    let mpesaRef: string | undefined = body.mpesaRef;
    let status: string | undefined = body.status;

    if (!txUid && body?.Body?.stkCallback) {
      const cb = body.Body.stkCallback;
      // Derive a UID strategy: allow client to pass via AccountReference or use CheckoutRequestID
      txUid = cb.CheckoutRequestID || cb.MerchantRequestID;
      status = cb.ResultCode === 0 ? 'SUCCESS' : 'FAILED';
      const items = cb.CallbackMetadata?.Item || [];
      const receiptItem = items.find((i: any) => i.Name === 'MpesaReceiptNumber');
      mpesaRef = receiptItem?.Value || cb.CheckoutRequestID;
    }

    if (!txUid || !status) {
      return res.status(400).json({ success: false, message: 'txUid and status are required' });
    }

    const existing = await prisma.escrowLog.findUnique({ where: { txUid } });
    if (!existing) return res.status(404).json({ success: false, message: 'Escrow not found' });

    const completedAt = new Date();
    const updatedHash = generateEscrowProofHash({
      txUid: existing.txUid,
      type: existing.type as 'HOLD' | 'RELEASE',
      amount: existing.amount,
      currency: existing.currency,
      status: (String(status || '').toUpperCase() as 'PENDING' | 'SUCCESS' | 'FAILED'),
      timestamp: completedAt,
      mpesaRef: mpesaRef || existing.mpesaRef || ''
    });

    const updated = await prisma.escrowLog.update({
      where: { txUid },
      data: {
        status: (String(status || '').toUpperCase() as any),
        mpesaRef: mpesaRef || existing.mpesaRef,
        completedAt,
        responseMeta: req.body,
        auditProofHash: updatedHash
      }
    });

    // On SUCCESS from STK, trigger B2B transfer to configured PayBill
    let b2b: any = null;
    if (String(status).toUpperCase() === 'SUCCESS') {
      try {
        b2b = await b2bTransfer({ amount: existing.amount });
      } catch (e) {
        // Attach error context but do not fail the webhook
        b2b = { error: (e as Error).message };
      }
    }

    return res.json({ success: true, message: 'Escrow updated from M-Pesa webhook', data: { escrow: updated, b2b } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Webhook processing failed', error: (error as Error).message });
  }
});

// B2B Result/Timeout webhooks
router.post('/webhook/mpesa-b2b/result', async (req: Request, res: Response) => {
  try {
    // Persist B2B result metadata for auditing
    // Optionally map to a specific escrow via AccountReference in payload
    return res.json({ success: true, message: 'B2B result received' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'B2B result processing failed', error: (error as Error).message });
  }
});

router.post('/webhook/mpesa-b2b/timeout', async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, message: 'B2B timeout received' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'B2B timeout processing failed', error: (error as Error).message });
  }
});

/**
 * @route   POST /api/escrow/release
 * @desc    Create a RELEASE escrow log (stub M-Pesa release)
 * @body    { txUid: string, amount: number, currency?: string, mpesaRef?: string }
 */
router.post('/release', async (req: Request, res: Response) => {
  try {
    const { txUid, amount, currency = 'KES', mpesaRef = '' } = req.body || {};
    if (!txUid || typeof amount !== 'number') {
      return res.status(400).json({ success: false, message: 'txUid and amount are required' });
    }

    const now = new Date();
    const proofHash = generateEscrowProofHash({
      txUid,
      type: 'RELEASE',
      amount,
      currency,
      status: 'PENDING',
      timestamp: now,
      mpesaRef
    });

    const created = await prisma.escrowLog.create({
      data: {
        txUid,
        type: 'RELEASE',
        amount,
        currency,
        status: 'PENDING',
        requestedAt: now,
        auditProofHash: proofHash,
        mpesaRef: mpesaRef || null,
        requestMeta: { stub: true, mpesa: { shortcode: mpesaConfig().shortcode } }
      }
    });

    return res.status(201).json({ success: true, message: 'Escrow RELEASE logged', data: created });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create escrow release', error: (error as Error).message });
  }
});


