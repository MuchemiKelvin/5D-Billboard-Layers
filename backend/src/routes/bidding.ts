import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { logger } from '../utils/logger';
import { prisma } from '../lib/database';
import { ApiResponse, Bid, BidStatus } from '../types';

const router = express.Router();

// Get all bids
router.get('/', [
  query('slotId').optional().isString(),
  query('companyId').optional().isString(),
  query('status').optional().isIn(['ACTIVE', 'OUTBID', 'WON', 'WITHDRAWN']),
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

    const { slotId, companyId, status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    if (slotId) where.slotId = slotId;
    if (companyId) where.companyId = companyId;
    if (status) where.status = status;

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { timestamp: 'desc' },
        include: {
          slot: {
            select: {
              id: true,
              slotNumber: true,
              slotType: true,
              status: true
            }
          },
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              tier: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      }),
      prisma.bid.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Bids retrieved successfully',
      data: {
        bids,
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
    logger.error('Bids retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Bids retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get active bids
router.get('/active', async (req: Request, res: Response) => {
  try {
    const { limit = 20 } = req.query;

    const activeBids = await prisma.bid.findMany({
      where: { status: 'ACTIVE' },
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
      include: {
        slot: {
          select: {
            id: true,
            slotNumber: true,
            slotType: true,
            status: true,
            reservePrice: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            tier: true
          }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Active bids retrieved successfully',
      data: activeBids
    };

    return res.json(response);

  } catch (error) {
    logger.error('Active bids retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Active bids retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Place bid
router.post('/', [
  body('slotId').isString().withMessage('Slot ID is required'),
  body('companyId').isString().withMessage('Company ID is required'),
  body('userId').isString().withMessage('User ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Bid amount must be positive'),
  body('bidderInfo').optional().isObject().withMessage('Bidder info must be an object')
], async (req: Request, res: Response) => {
  console.log('POST /api/bidding received:', req.body);
  logger.info('POST /api/bidding route hit', { body: req.body });
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { slotId, companyId, userId, amount, bidderInfo } = req.body;

    // Check if slot exists and is available for bidding
    const slot = await prisma.slot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    if (slot.status !== 'AUCTION_ACTIVE' && slot.status !== 'AVAILABLE') {
      return res.status(400).json({
        success: false,
        message: 'Slot is not available for bidding'
      });
    }

    // Check if company exists and is eligible
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    if (!company.auctionEligible) {
      return res.status(400).json({
        success: false,
        message: 'Company is not eligible for bidding'
      });
    }

    if (amount > company.maxBidAmount) {
      return res.status(400).json({
        success: false,
        message: `Bid amount exceeds company's maximum bid limit of ${company.maxBidAmount}`
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if bid meets minimum requirements
    if (amount < slot.reservePrice) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be at least ${slot.reservePrice} (reserve price)`
      });
    }

    // Check if bid is higher than current bid
    if (amount <= slot.currentBid) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be higher than current bid of ${slot.currentBid}`
      });
    }

    // Create the bid
    const bid = await prisma.bid.create({
      data: {
        slotId,
        companyId,
        userId,
        amount,
        status: 'ACTIVE',
        bidderInfo: bidderInfo || undefined,
        timestamp: new Date()
      },
      include: {
        slot: {
          select: {
            slotNumber: true,
            slotType: true
          }
        },
        company: {
          select: {
            name: true,
            logo: true
          }
        },
        user: {
          select: {
            username: true
          }
        }
      }
    });

    // Update slot with new bid
    await prisma.slot.update({
      where: { id: slotId },
      data: {
        currentBid: amount,
        currentSponsor: companyId,
        status: 'AUCTION_ACTIVE',
        lastBidTime: new Date(),
        totalBids: { increment: 1 }
      }
    });

    // Mark previous bids as outbid
    await prisma.bid.updateMany({
      where: {
        slotId,
        id: { not: bid.id },
        status: 'ACTIVE'
      },
      data: {
        status: 'OUTBID'
      }
    });

    logger.info(`New bid placed: ${amount} for slot ${slot.slotNumber} by ${company.name}`);

    const response: ApiResponse = {
      success: true,
      message: 'Bid placed successfully',
      data: bid
    };

    return res.status(201).json(response);

  } catch (error) {
    logger.error('Bid placement failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Bid placement failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get bid by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is required'
      });
    }

    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        slot: {
          select: {
            id: true,
            slotNumber: true,
            slotType: true,
            status: true,
            reservePrice: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            tier: true,
            maxBidAmount: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Bid retrieved successfully',
      data: bid
    };

    return res.json(response);

  } catch (error) {
    logger.error('Bid retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Bid retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get bids for specific slot
router.get('/slot/:slotId', async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const { status, limit = 10 } = req.query;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    const where: any = { slotId };
    if (status) where.status = status;

    const bids = await prisma.bid.findMany({
      where,
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            tier: true
          }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Slot bids retrieved successfully',
      data: bids
    };

    return res.json(response);

  } catch (error) {
    logger.error('Slot bids retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Slot bids retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get bids by company
router.get('/company/:companyId', async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const { status, limit = 20 } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const where: any = { companyId };
    if (status) where.status = status;

    const bids = await prisma.bid.findMany({
      where,
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
      include: {
        slot: {
          select: {
            id: true,
            slotNumber: true,
            slotType: true,
            status: true
          }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Company bids retrieved successfully',
      data: bids
    };

    return res.json(response);

  } catch (error) {
    logger.error('Company bids retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Company bids retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Update bid
router.put('/:id', [
  body('amount').optional().isFloat({ min: 0.01 }),
  body('status').optional().isIn(['ACTIVE', 'OUTBID', 'WON', 'WITHDRAWN']),
  body('bidderInfo').optional().isObject()
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
        message: 'Bid ID is required'
      });
    }

    // Check if bid exists
    const existingBid = await prisma.bid.findUnique({
      where: { id }
    });

    if (!existingBid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    // Handle bidder info update - no need to stringify as Prisma handles JSON

    const bid = await prisma.bid.update({
      where: { id },
      data: updateData,
      include: {
        slot: {
          select: {
            slotNumber: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      }
    });

    logger.info(`Bid updated: ${id}`);

    const response: ApiResponse = {
      success: true,
      message: 'Bid updated successfully',
      data: bid
    };

    return res.json(response);

  } catch (error) {
    logger.error('Bid update failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Bid update failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Withdraw bid
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is required'
      });
    }

    // Check if bid exists
    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        slot: {
          select: {
            id: true,
            slotNumber: true,
            currentBid: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      }
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    if (bid.status === 'WITHDRAWN') {
      return res.status(400).json({
        success: false,
        message: 'Bid is already withdrawn'
      });
    }

    // Update bid status
    await prisma.bid.update({
      where: { id },
      data: { status: 'WITHDRAWN' }
    });

    // If this was the current highest bid, update slot
    if (bid.amount === bid.slot.currentBid && bid.status === 'ACTIVE') {
      // Find the next highest active bid
      const nextBid = await prisma.bid.findFirst({
        where: {
          slotId: bid.slot.id,
          status: 'ACTIVE',
          id: { not: id }
        },
        orderBy: { amount: 'desc' }
      });

      if (nextBid) {
        // Update slot with next highest bid
        await prisma.slot.update({
          where: { id: bid.slot.id },
          data: {
            currentBid: nextBid.amount,
            currentSponsor: nextBid.companyId,
            lastBidTime: nextBid.timestamp
          }
        });
      } else {
        // No more active bids, reset slot
        await prisma.slot.update({
          where: { id: bid.slot.id },
          data: {
            currentBid: 0,
            currentSponsor: null,
            status: 'AVAILABLE',
            lastBidTime: null
          }
        });
      }
    }

    logger.info(`Bid withdrawn: ${id} for slot ${bid.slot.slotNumber}`);

    const response: ApiResponse = {
      success: true,
      message: 'Bid withdrawn successfully'
    };

    return res.json(response);

  } catch (error) {
    logger.error('Bid withdrawal failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Bid withdrawal failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get bid history for slot
router.get('/history/:slotId', async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const { limit = 50 } = req.query;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    const bidHistory = await prisma.bid.findMany({
      where: { slotId },
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            tier: true
          }
        },
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Bid history retrieved successfully',
      data: bidHistory
    };

    return res.json(response);

  } catch (error) {
    logger.error('Bid history retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Bid history retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Accept bid (admin only)
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is required'
      });
    }

    // Check if bid exists
    const bid = await prisma.bid.findUnique({
      where: { id },
      include: {
        slot: {
          select: {
            id: true,
            slotNumber: true
          }
        },
        company: {
          select: {
            name: true
          }
        }
      }
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    if (bid.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Only active bids can be accepted'
      });
    }

    // Update bid status to won
    await prisma.bid.update({
      where: { id },
      data: { status: 'WON' }
    });

    // Mark all other bids for this slot as outbid
    await prisma.bid.updateMany({
      where: {
        slotId: bid.slotId,
        id: { not: id },
        status: 'ACTIVE'
      },
      data: {
        status: 'OUTBID'
      }
    });

    // Update slot status
    await prisma.slot.update({
      where: { id: bid.slotId },
      data: {
        status: 'OCCUPIED',
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      }
    });

    logger.info(`Bid accepted: ${id} for slot ${bid.slot.slotNumber} by ${bid.company.name}`);

    const response: ApiResponse = {
      success: true,
      message: 'Bid accepted successfully'
    };

    return res.json(response);

  } catch (error) {
    logger.error('Bid acceptance failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Bid acceptance failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Reject bid (admin only)
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Bid ID is required'
      });
    }

    // Check if bid exists
    const bid = await prisma.bid.findUnique({
      where: { id }
    });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Bid not found'
      });
    }

    if (bid.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Only active bids can be rejected'
      });
    }

    // Update bid status to withdrawn
    await prisma.bid.update({
      where: { id },
      data: { status: 'WITHDRAWN' }
    });

    logger.info(`Bid rejected: ${id}`);

    const response: ApiResponse = {
      success: true,
      message: 'Bid rejected successfully'
    };

    return res.json(response);

  } catch (error) {
    logger.error('Bid rejection failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Bid rejection failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

export default router;

