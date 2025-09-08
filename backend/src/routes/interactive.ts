import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';
import crypto from 'crypto';

const router = express.Router();

// Validation middleware
const validateHiddenContent = [
  body('slotId').notEmpty().withMessage('Slot ID is required'),
  body('type').isIn(['OFFER', 'HIDDEN_CONTENT', 'BID_PARTICIPATION', 'SPECIAL_DEAL', 'PROMOTION']).withMessage('Invalid content type'),
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('value').notEmpty().withMessage('Value is required'),
  body('unlockRequirement').notEmpty().withMessage('Unlock requirement is required'),
  body('expiresAt').optional().isISO8601().withMessage('Expires at must be a valid ISO 8601 date')
];

const validateQRCode = [
  body('slotId').notEmpty().withMessage('Slot ID is required'),
  body('data').isObject().withMessage('QR code data is required')
];

const validateNFCTag = [
  body('slotId').notEmpty().withMessage('Slot ID is required'),
  body('data').isObject().withMessage('NFC tag data is required')
];

/**
 * @route   POST /api/interactive/hidden-content
 * @desc    Create hidden content for a slot
 * @access  Public
 */
router.post('/hidden-content', validateHiddenContent, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { slotId, type, title, description, value, unlockRequirement, expiresAt } = req.body;

    // Verify slot exists
    const slot = await prisma.slot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      res.status(404).json({
        success: false,
        message: 'Slot not found'
      } as ApiResponse);
      return;
    }

    const hiddenContent = await prisma.hiddenContent.create({
      data: {
        slotId,
        type,
        title,
        description,
        value,
        unlockRequirement,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      },
      include: {
        slot: {
          select: { slotNumber: true, slotType: true }
        }
      }
    });

    logger.info(`Hidden content created: ${hiddenContent.id} for slot: ${slot.slotNumber}`);

    res.status(201).json({
      success: true,
      message: 'Hidden content created successfully',
      data: hiddenContent
    } as ApiResponse);

  } catch (error) {
    logger.error('Error creating hidden content:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/interactive/hidden-content
 * @desc    Get hidden content
 * @access  Public
 */
router.get('/hidden-content', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId, type, isUnlocked, isActive, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (slotId) where.slotId = slotId;
    if (type) where.type = type;
    if (isUnlocked !== undefined) where.isUnlocked = isUnlocked === 'true';
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [content, total] = await Promise.all([
      prisma.hiddenContent.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          slot: {
            select: { slotNumber: true, slotType: true, currentSponsor: true }
          },
          interactions: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      }),
      prisma.hiddenContent.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Hidden content retrieved successfully',
      data: {
        content,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving hidden content:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   PUT /api/interactive/hidden-content/:id/unlock
 * @desc    Unlock hidden content
 * @access  Public
 */
router.put('/hidden-content/:id/unlock', [
  body('userId').optional().isString().withMessage('User ID must be a string'),
  body('interactionType').isIn(['VIEW', 'LIKE', 'SHARE', 'UNLOCK', 'SCAN', 'TAP']).withMessage('Invalid interaction type')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { id } = req.params;
    const { userId, interactionType } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Content ID is required'
      } as ApiResponse);
      return;
    }

    const content = await prisma.hiddenContent.findUnique({
      where: { id }
    });

    if (!content) {
      res.status(404).json({
        success: false,
        message: 'Hidden content not found'
      } as ApiResponse);
      return;
    }

    // Check if content has expired
    if (content.expiresAt && new Date() > content.expiresAt) {
      res.status(400).json({
        success: false,
        message: 'Content has expired'
      } as ApiResponse);
      return;
    }

    // Unlock content and increment views
    const updatedContent = await prisma.hiddenContent.update({
      where: { id },
      data: {
        isUnlocked: true,
        views: { increment: 1 }
      }
    });

    // Log interaction
    await prisma.hiddenContentInteraction.create({
      data: {
        contentId: id,
        userId: userId || null,
        interactionType,
        metadata: { unlocked: true, timestamp: new Date() }
      }
    });

    logger.info(`Hidden content unlocked: ${id} by user: ${userId || 'anonymous'}`);

    res.status(200).json({
      success: true,
      message: 'Hidden content unlocked successfully',
      data: updatedContent
    } as ApiResponse);

  } catch (error) {
    logger.error('Error unlocking hidden content:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/interactive/qr-codes
 * @desc    Create QR code for a slot
 * @access  Public
 */
router.post('/qr-codes', validateQRCode, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { slotId, data } = req.body;

    // Verify slot exists
    const slot = await prisma.slot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      res.status(404).json({
        success: false,
        message: 'Slot not found'
      } as ApiResponse);
      return;
    }

    // Generate unique ID for QR code
    const uniqueId = crypto.randomUUID();

    const qrCode = await prisma.qRCode.create({
      data: {
        slotId,
        uniqueId,
        data
      },
      include: {
        slot: {
          select: { slotNumber: true, slotType: true }
        }
      }
    });

    logger.info(`QR code created: ${qrCode.id} for slot: ${slot.slotNumber}`);

    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      data: qrCode
    } as ApiResponse);

  } catch (error) {
    logger.error('Error creating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/interactive/qr-codes
 * @desc    Get QR codes
 * @access  Public
 */
router.get('/qr-codes', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId, isActive, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (slotId) where.slotId = slotId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          slot: {
            select: { slotNumber: true, slotType: true, currentSponsor: true }
          },
          scans: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      }),
      prisma.qRCode.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'QR codes retrieved successfully',
      data: {
        qrCodes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/interactive/qr-codes/:id/scan
 * @desc    Record QR code scan
 * @access  Public
 */
router.post('/qr-codes/:id/scan', [
  body('userId').optional().isString().withMessage('User ID must be a string'),
  body('deviceInfo').optional().isObject().withMessage('Device info must be an object'),
  body('location').optional().isObject().withMessage('Location must be an object')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { id } = req.params;
    const { userId, deviceInfo, location } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'QR code ID is required'
      } as ApiResponse);
      return;
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { id }
    });

    if (!qrCode) {
      res.status(404).json({
        success: false,
        message: 'QR code not found'
      } as ApiResponse);
      return;
    }

    // Record scan
    const scan = await prisma.qRCodeScan.create({
      data: {
        qrCodeId: id,
        userId: userId || null,
        deviceInfo,
        location
      }
    });

    // Update scan count and last scan time
    await prisma.qRCode.update({
      where: { id },
      data: {
        scanCount: { increment: 1 },
        lastScanTime: new Date()
      }
    });

    logger.info(`QR code scanned: ${id} by user: ${userId || 'anonymous'}`);

    res.status(201).json({
      success: true,
      message: 'QR code scan recorded successfully',
      data: scan
    } as ApiResponse);

  } catch (error) {
    logger.error('Error recording QR code scan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/interactive/nfc-tags
 * @desc    Create NFC tag for a slot
 * @access  Public
 */
router.post('/nfc-tags', validateNFCTag, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { slotId, data } = req.body;

    // Verify slot exists
    const slot = await prisma.slot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      res.status(404).json({
        success: false,
        message: 'Slot not found'
      } as ApiResponse);
      return;
    }

    // Generate unique tag ID
    const tagId = crypto.randomUUID();

    const nfcTag = await prisma.nFCTag.create({
      data: {
        slotId,
        tagId,
        data
      },
      include: {
        slot: {
          select: { slotNumber: true, slotType: true }
        }
      }
    });

    logger.info(`NFC tag created: ${nfcTag.id} for slot: ${slot.slotNumber}`);

    res.status(201).json({
      success: true,
      message: 'NFC tag created successfully',
      data: nfcTag
    } as ApiResponse);

  } catch (error) {
    logger.error('Error creating NFC tag:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/interactive/nfc-tags
 * @desc    Get NFC tags
 * @access  Public
 */
router.get('/nfc-tags', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId, isActive, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (slotId) where.slotId = slotId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [nfcTags, total] = await Promise.all([
      prisma.nFCTag.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          slot: {
            select: { slotNumber: true, slotType: true, currentSponsor: true }
          },
          taps: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      }),
      prisma.nFCTag.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'NFC tags retrieved successfully',
      data: {
        nfcTags,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving NFC tags:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/interactive/nfc-tags/:id/tap
 * @desc    Record NFC tag tap
 * @access  Public
 */
router.post('/nfc-tags/:id/tap', [
  body('userId').optional().isString().withMessage('User ID must be a string'),
  body('deviceInfo').optional().isObject().withMessage('Device info must be an object'),
  body('location').optional().isObject().withMessage('Location must be an object')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { id } = req.params;
    const { userId, deviceInfo, location } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'NFC tag ID is required'
      } as ApiResponse);
      return;
    }

    const nfcTag = await prisma.nFCTag.findUnique({
      where: { id }
    });

    if (!nfcTag) {
      res.status(404).json({
        success: false,
        message: 'NFC tag not found'
      } as ApiResponse);
      return;
    }

    // Record tap
    const tap = await prisma.nFCTap.create({
      data: {
        nfcTagId: id,
        userId: userId || null,
        deviceInfo,
        location
      }
    });

    // Update interaction count and last interaction time
    await prisma.nFCTag.update({
      where: { id },
      data: {
        interactions: { increment: 1 },
        lastInteractionTime: new Date()
      }
    });

    logger.info(`NFC tag tapped: ${id} by user: ${userId || 'anonymous'}`);

    res.status(201).json({
      success: true,
      message: 'NFC tag tap recorded successfully',
      data: tap
    } as ApiResponse);

  } catch (error) {
    logger.error('Error recording NFC tag tap:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/interactive/analytics
 * @desc    Get interactive content analytics
 * @access  Public
 */
router.get('/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slotId, dateFrom, dateTo } = req.query;

    const where: any = {};
    if (slotId) where.slotId = slotId;
    if (dateFrom || dateTo) {
      where.timestamp = {};
      if (dateFrom) where.timestamp.gte = new Date(dateFrom as string);
      if (dateTo) where.timestamp.lte = new Date(dateTo as string);
    }

    // Get QR code analytics
    const qrAnalytics = await prisma.qRCodeScan.groupBy({
      by: ['qrCodeId'],
      where: dateFrom || dateTo ? { timestamp: where.timestamp } : {},
      _count: { id: true },
      _max: { timestamp: true }
    });

    // Get NFC analytics
    const nfcAnalytics = await prisma.nFCTap.groupBy({
      by: ['nfcTagId'],
      where: dateFrom || dateTo ? { timestamp: where.timestamp } : {},
      _count: { id: true },
      _max: { timestamp: true }
    });

    // Get hidden content analytics
    const contentAnalytics = await prisma.hiddenContentInteraction.groupBy({
      by: ['contentId', 'interactionType'],
      where: dateFrom || dateTo ? { timestamp: where.timestamp } : {},
      _count: { id: true }
    });

    res.status(200).json({
      success: true,
      message: 'Interactive analytics retrieved successfully',
      data: {
        qrCodeScans: qrAnalytics,
        nfcTaps: nfcAnalytics,
        contentInteractions: contentAnalytics,
        summary: {
          totalQRScans: qrAnalytics.reduce((sum, item) => sum + item._count.id, 0),
          totalNFCTaps: nfcAnalytics.reduce((sum, item) => sum + item._count.id, 0),
          totalContentInteractions: contentAnalytics.reduce((sum, item) => sum + item._count.id, 0)
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving interactive analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
