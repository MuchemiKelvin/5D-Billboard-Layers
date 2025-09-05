import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const router = express.Router();

// Validation middleware
const validateARContent = [
  body('title').notEmpty().withMessage('Title is required'),
  body('contentType').isIn(['LOGO_HOLOGRAM', 'INFO_PANEL', 'PRODUCT_SHOWCASE', 'INTERACTIVE_3D']).withMessage('Invalid AR content type'),
  body('description').optional().isString(),
  body('contentData').optional().isObject(),
  body('slotId').isString().withMessage('Slot ID is required'),
  body('isActive').optional().isBoolean()
];

const validateHologramEffect = [
  body('effectType').notEmpty().withMessage('Effect type is required'),
  body('settings').optional().isObject(),
  body('slotId').isString().withMessage('Slot ID is required'),
  body('isActive').optional().isBoolean()
];

/**
 * @route   GET /api/ar-content
 * @desc    Get all AR content
 * @access  Public
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { contentType, slotId, isActive, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (contentType) where.contentType = contentType;
    if (slotId) where.slotId = slotId;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [arContent, total] = await Promise.all([
      prisma.aRContent.findMany({
        where,
        include: {
          slot: true
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.aRContent.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'AR content retrieved successfully',
      data: {
        arContent,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving AR content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AR content',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/ar-content/:id
 * @desc    Get AR content by ID
 * @access  Public
 */
router.get('/:id', [
  param('id').isString().withMessage('Invalid AR content ID')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'AR content ID is required'
      });
      return;
    }

    const arContent = await prisma.aRContent.findUnique({
      where: { id },
              include: {
          slot: true
        }
    });

    if (!arContent) {
      res.status(404).json({
        success: false,
        message: 'AR content not found'
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'AR content retrieved successfully',
      data: { arContent }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving AR content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve AR content',
      error: (error as Error).message
    });
  }
});

/**
 * @route   POST /api/ar-content
 * @desc    Create new AR content
 * @access  Public (for testing)
 */
router.post('/', validateARContent, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { title, contentType, description, contentData, slotId, isActive = true } = req.body;

    // Verify slot exists
    if (!slotId) {
      res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
      return;
    }

    const slot = await prisma.slot.findUnique({
      where: { id: slotId }
    });
    if (!slot) {
      res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
      return;
    }

    const arContent = await prisma.aRContent.create({
      data: {
        title,
        contentType,
        description,
        contentData: contentData || {},
        slotId,
        isActive
      },
              include: {
          slot: true
        }
    });

    const response: ApiResponse = {
      success: true,
      message: 'AR content created successfully',
      data: { arContent }
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating AR content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create AR content',
      error: (error as Error).message
    });
  }
});

/**
 * @route   PUT /api/ar-content/:id
 * @desc    Update AR content
 * @access  Public (for testing)
 */
router.put('/:id', [
  param('id').isString().withMessage('Invalid AR content ID'),
  ...validateARContent
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { title, contentType, description, contentData, slotId, isActive } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'AR content ID is required'
      });
      return;
    }

    // Check if AR content exists
    const existingContent = await prisma.aRContent.findUnique({
      where: { id }
    });

    if (!existingContent) {
      res.status(404).json({
        success: false,
        message: 'AR content not found'
      });
      return;
    }

    // Verify slot exists if provided
    if (slotId) {
      const slot = await prisma.slot.findUnique({
        where: { id: slotId }
      });
      if (!slot) {
        res.status(404).json({
          success: false,
          message: 'Slot not found'
        });
        return;
      }
    }

    const arContent = await prisma.aRContent.update({
      where: { id },
      data: {
        title,
        contentType,
        description,
        contentData: contentData || existingContent.contentData,
        slotId: slotId || existingContent.slotId,
        isActive: isActive !== undefined ? isActive : existingContent.isActive
      },
              include: {
          slot: true
        }
    });

    const response: ApiResponse = {
      success: true,
      message: 'AR content updated successfully',
      data: { arContent }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating AR content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update AR content',
      error: (error as Error).message
    });
  }
});

/**
 * @route   DELETE /api/ar-content/:id
 * @desc    Delete AR content
 * @access  Public (for testing)
 */
router.delete('/:id', [
  param('id').isString().withMessage('Invalid AR content ID')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'AR content ID is required'
      });
      return;
    }

    // Check if AR content exists
    const existingContent = await prisma.aRContent.findUnique({
      where: { id }
    });

    if (!existingContent) {
      res.status(404).json({
        success: false,
        message: 'AR content not found'
      });
      return;
    }

    // Delete associated hologram effects first
    await prisma.hologramEffect.deleteMany({
      where: { slotId: existingContent.slotId }
    });

    // Delete the AR content
    await prisma.aRContent.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'AR content deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error deleting AR content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete AR content',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/ar-content/:id/hologram-effects
 * @desc    Get hologram effects for AR content
 * @access  Public
 */
router.get('/:id/hologram-effects', [
  param('id').isString().withMessage('Invalid AR content ID')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'AR content ID is required'
      });
      return;
    }

    // Check if AR content exists
    const arContent = await prisma.aRContent.findUnique({
      where: { id }
    });

    if (!arContent) {
      res.status(404).json({
        success: false,
        message: 'AR content not found'
      });
      return;
    }

    const hologramEffects = await prisma.hologramEffect.findMany({
      where: { slotId: arContent.slotId },
      orderBy: { createdAt: 'desc' }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Hologram effects retrieved successfully',
      data: { hologramEffects }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving hologram effects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve hologram effects',
      error: (error as Error).message
    });
  }
});

/**
 * @route   POST /api/ar-content/:id/hologram-effects
 * @desc    Create hologram effect for AR content
 * @access  Public (for testing)
 */
router.post('/:id/hologram-effects', [
  param('id').isString().withMessage('Invalid AR content ID'),
  ...validateHologramEffect
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { effectType, settings, slotId, isActive = true } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'AR content ID is required'
      });
      return;
    }

    // Check if AR content exists
    const arContent = await prisma.aRContent.findUnique({
      where: { id }
    });

    if (!arContent) {
      res.status(404).json({
        success: false,
        message: 'AR content not found'
      });
      return;
    }

    const hologramEffect = await prisma.hologramEffect.create({
      data: {
        effectType,
        settings: settings || {},
        slotId: slotId || arContent.slotId,
        isActive
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Hologram effect created successfully',
      data: { hologramEffect }
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating hologram effect:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hologram effect',
      error: (error as Error).message
    });
  }
});

/**
 * @route   POST /api/ar-content/:id/activate
 * @desc    Activate AR content
 * @access  Public (for testing)
 */
router.post('/:id/activate', [
  param('id').isString().withMessage('Invalid AR content ID')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'AR content ID is required'
      });
      return;
    }

    const arContent = await prisma.aRContent.update({
      where: { id },
      data: { isActive: true },
              include: {
          slot: true
        }
    });

    const response: ApiResponse = {
      success: true,
      message: 'AR content activated successfully',
      data: { arContent }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error activating AR content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate AR content',
      error: (error as Error).message
    });
  }
});

/**
 * @route   POST /api/ar-content/:id/deactivate
 * @desc    Deactivate AR content
 * @access  Public (for testing)
 */
router.post('/:id/deactivate', [
  param('id').isString().withMessage('Invalid AR content ID')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'AR content ID is required'
      });
      return;
    }

    const arContent = await prisma.aRContent.update({
      where: { id },
      data: { isActive: false },
              include: {
          slot: true
        }
    });

    const response: ApiResponse = {
      success: true,
      message: 'AR content deactivated successfully',
      data: { arContent }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error deactivating AR content:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate AR content',
      error: (error as Error).message
    });
  }
});

export default router;
