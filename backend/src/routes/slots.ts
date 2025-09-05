import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { logger } from '../utils/logger';
import { prisma } from '../lib/database';
import { ApiResponse, Slot, SlotType, SlotStatus } from '../types';

const router = express.Router();

// Get all slots
router.get('/', [
  query('status').optional().isIn(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'AUCTION_ACTIVE']),
  query('slotType').optional().isIn(['STANDARD', 'MAIN_SPONSOR', 'LIVE_BIDDING']),
  query('isActive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, slotType, isActive, page = 1, limit = 24 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (slotType) where.slotType = slotType;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [slots, total] = await Promise.all([
      prisma.slot.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { slotNumber: 'asc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              tier: true
            }
          },
          _count: {
            select: {
              bids: true,
              analytics: true
            }
          }
        }
      }),
      prisma.slot.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Slots retrieved successfully',
      data: {
        slots,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slots retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slots retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get slot by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    const slot = await prisma.slot.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            tier: true,
            website: true
          }
        },
        bids: {
          select: {
            id: true,
            amount: true,
            status: true,
            timestamp: true,
            user: {
              select: {
                username: true
              }
            }
          },
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        arContent: {
          select: {
            id: true,
            title: true,
            contentType: true,
            isActive: true
          }
        },
        hologramEffects: {
          select: {
            id: true,
            effectType: true,
            isActive: true
          }
        },
        _count: {
          select: {
            bids: true,
            analytics: true
          }
        }
      }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Slot retrieved successfully',
      data: slot
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slot retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get slot by number (1-24)
router.get('/number/:slotNumber', async (req: Request, res: Response) => {
  try {
    const { slotNumber } = req.params;
    
    if (!slotNumber) {
      return res.status(400).json({
        success: false,
        message: 'Slot number is required'
      });
    }
    
    const slotNum = parseInt(slotNumber);

    if (isNaN(slotNum) || slotNum < 1 || slotNum > 24) {
      return res.status(400).json({
        success: false,
        message: 'Slot number must be between 1 and 24'
      });
    }

    const slot = await prisma.slot.findUnique({
      where: { slotNumber: slotNum },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            tier: true,
            website: true
          }
        },
        bids: {
          select: {
            id: true,
            amount: true,
            status: true,
            timestamp: true,
            user: {
              select: {
                username: true
              }
            }
          },
          orderBy: { timestamp: 'desc' },
          take: 5
        },
        _count: {
          select: {
            bids: true,
            analytics: true
          }
        }
      }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Slot retrieved successfully',
      data: slot
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slot retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Create new slot
router.post('/', [
  body('slotNumber').isInt({ min: 1, max: 24 }).withMessage('Slot number must be between 1 and 24'),
  body('slotType').isIn(['STANDARD', 'MAIN_SPONSOR', 'LIVE_BIDDING']).withMessage('Valid slot type is required'),
  body('position').isObject().withMessage('Position object is required'),
  body('reservePrice').optional().isFloat({ min: 0 }).withMessage('Reserve price must be positive'),
  body('category').optional().isLength({ max: 50 }),
  body('description').optional().isLength({ max: 200 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      slotNumber,
      slotType,
      position,
      reservePrice = 100000,
      category,
      description
    } = req.body;

    // Check if slot number already exists
    const existingSlot = await prisma.slot.findUnique({
      where: { slotNumber }
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'Slot number already exists'
      });
    }

    const slot = await prisma.slot.create({
      data: {
        slotNumber,
        slotType,
        position: JSON.stringify(position),
        reservePrice,
        category,
        description,
        isActive: true
      }
    });

    logger.info(`New slot created: ${slotNumber} (${slotType})`);

    const response: ApiResponse = {
      success: true,
      message: 'Slot created successfully',
      data: slot
    };

    return res.status(201).json(response);

  } catch (error) {
    logger.error('Slot creation failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot creation failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Update slot
router.put('/:id', [
  body('slotType').optional().isIn(['STANDARD', 'MAIN_SPONSOR', 'LIVE_BIDDING']),
  body('position').optional().isObject(),
  body('reservePrice').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(['AVAILABLE', 'OCCUPIED', 'RESERVED', 'AUCTION_ACTIVE']),
  body('category').optional().isLength({ max: 50 }),
  body('description').optional().isLength({ max: 200 }),
  body('isActive').optional().isBoolean()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    // Check if slot exists
    const existingSlot = await prisma.slot.findUnique({
      where: { id }
    });

    if (!existingSlot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Handle position update
    if (updateData.position) {
      updateData.position = JSON.stringify(updateData.position);
    }

    const slot = await prisma.slot.update({
      where: { id },
      data: updateData
    });

    logger.info(`Slot updated: ${slot.slotNumber}`);

    const response: ApiResponse = {
      success: true,
      message: 'Slot updated successfully',
      data: slot
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slot update failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot update failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Delete slot
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    // Check if slot exists
    const slot = await prisma.slot.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bids: true,
            analytics: true
          }
        }
      }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Check if slot has associated data
    if (slot._count.bids > 0 || slot._count.analytics > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete slot with associated bids or analytics. Deactivate instead.'
      });
    }

    await prisma.slot.delete({
      where: { id }
    });

    logger.info(`Slot deleted: ${slot.slotNumber}`);

    const response: ApiResponse = {
      success: true,
      message: 'Slot deleted successfully'
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slot deletion failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot deletion failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get currently active slot
router.get('/active/current', async (req: Request, res: Response) => {
  try {
    // This would typically be determined by a rotation system
    // For now, we'll return the first occupied slot
    const activeSlot = await prisma.slot.findFirst({
      where: {
        status: { in: ['OCCUPIED', 'AUCTION_ACTIVE'] },
        isActive: true
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            tier: true
          }
        }
      },
      orderBy: { slotNumber: 'asc' }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Active slot retrieved successfully',
      data: activeSlot
    };

    return res.json(response);

  } catch (error) {
    logger.error('Active slot retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Active slot retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get available slots for booking
router.get('/available', async (req: Request, res: Response) => {
  try {
    const { slotType, excludeCompany } = req.query;

    const where: any = {
      status: 'AVAILABLE',
      isActive: true
    };

    if (slotType) where.slotType = slotType;
    if (excludeCompany) where.currentSponsor = { not: excludeCompany };

    const availableSlots = await prisma.slot.findMany({
      where,
      orderBy: { slotNumber: 'asc' },
      include: {
        _count: {
          select: {
            bids: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Available slots retrieved successfully',
      data: availableSlots
    };

    return res.json(response);

  } catch (error) {
    logger.error('Available slots retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Available slots retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Book slot for sponsor
router.post('/:id/book', [
  body('companyId').isString().withMessage('Company ID is required'),
  body('startTime').optional().isISO8601().withMessage('Valid start time is required'),
  body('endTime').optional().isISO8601().withMessage('Valid end time is required'),
  body('bidAmount').optional().isFloat({ min: 0 }).withMessage('Bid amount must be positive')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { companyId, startTime, endTime, bidAmount = 0 } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    // Check if slot exists and is available
    const slot = await prisma.slot.findUnique({
      where: { id }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (slot.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'Slot is not available for booking'
      });
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update slot
    const updatedSlot = await prisma.slot.update({
      where: { id },
      data: {
        currentSponsor: companyId,
        currentBid: bidAmount,
        status: 'OCCUPIED',
        startTime: startTime ? new Date(startTime) : new Date(),
        endTime: endTime ? new Date(endTime) : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours default
        lastBidTime: new Date()
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            tier: true
          }
        }
      }
    });

    logger.info(`Slot ${slot.slotNumber} booked for company ${company.name}`);

    const response: ApiResponse = {
      success: true,
      message: 'Slot booked successfully',
      data: updatedSlot
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slot booking failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot booking failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Release slot booking
router.post('/:id/release', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    // Check if slot exists
    const slot = await prisma.slot.findUnique({
      where: { id }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (slot.status === 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'Slot is already available'
      });
    }

    // Release slot
    const updatedSlot = await prisma.slot.update({
      where: { id },
      data: {
        currentSponsor: null,
        currentBid: 0,
        status: 'AVAILABLE',
        startTime: null,
        endTime: null,
        lastBidTime: null
      }
    });

    logger.info(`Slot ${slot.slotNumber} released`);

    const response: ApiResponse = {
      success: true,
      message: 'Slot released successfully',
      data: updatedSlot
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slot release failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot release failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get slot performance metrics
router.get('/:id/performance', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    const slot = await prisma.slot.findUnique({
      where: { id }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Build date filter
    const dateFilter: any = { slotId: id };
    if (startDate && endDate) {
      dateFilter.timestamp = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    // Get analytics data
    const [totalViews, totalBids, avgBidAmount, topBid] = await Promise.all([
      prisma.analytics.count({
        where: {
          ...dateFilter,
          eventType: 'SLOT_VIEW'
        }
      }),
      prisma.bid.count({
        where: { slotId: id }
      }),
      prisma.bid.aggregate({
        where: { slotId: id },
        _avg: { amount: true }
      }),
      prisma.bid.findFirst({
        where: { slotId: id },
        orderBy: { amount: 'desc' },
        select: { amount: true, timestamp: true }
      })
    ]);

    const performance = {
      slot: {
        id: slot.id,
        slotNumber: slot.slotNumber,
        status: slot.status
      },
      metrics: {
        totalViews,
        totalBids,
        avgBidAmount: avgBidAmount._avg?.amount || 0,
        topBid: topBid?.amount || 0,
        topBidDate: topBid?.timestamp || null
      }
    };

    const response: ApiResponse = {
      success: true,
      message: 'Slot performance metrics retrieved successfully',
      data: performance
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slot performance retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot performance retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

export default router;
