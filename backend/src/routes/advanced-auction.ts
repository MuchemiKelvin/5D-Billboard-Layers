import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const auctionSessionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  autoExtend: z.boolean().default(false),
  extendDuration: z.number().min(60).default(300), // 5 minutes default
  maxExtensions: z.number().min(0).default(3),
  reservePrice: z.number().min(0).optional(),
  bidIncrement: z.number().min(1).default(1000),
  status: z.enum(['SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).default('SCHEDULED')
});

const bidValidationSchema = z.object({
  slotId: z.string(),
  companyId: z.string(),
  userId: z.string(),
  amount: z.number().min(1),
  bidderInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional()
  })
});

const auctionNotificationSchema = z.object({
  auctionId: z.string(),
  type: z.enum(['BID_PLACED', 'BID_OUTBID', 'AUCTION_STARTING', 'AUCTION_ENDING', 'AUCTION_EXTENDED', 'AUCTION_COMPLETED']),
  recipientType: z.enum(['ALL', 'BIDDERS', 'COMPANY', 'USER']),
  recipientId: z.string().optional(),
  message: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM')
});

// Create Auction Session
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const data = auctionSessionSchema.parse(req.body);

    // Validate time constraints
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    if (startTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start time cannot be in the past'
      });
    }

    const auctionSession = await prisma.auctionSession.create({
      data: {
        name: data.name,
        description: data.description || null,
        startTime,
        endTime,
        autoExtend: data.autoExtend,
        extendDuration: data.extendDuration,
        maxExtensions: data.maxExtensions,
        reservePrice: data.reservePrice || null,
        bidIncrement: data.bidIncrement,
        status: data.status
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Auction session created successfully',
      data: { auctionSession }
    });
  } catch (error) {
    console.error('Create auction session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create auction session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get All Auction Sessions
router.get('/sessions', async (req: Request, res: Response) => {
  try {
    const { status, limit = '20', page = '1' } = req.query;
    
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [sessions, total] = await Promise.all([
      prisma.auctionSession.findMany({
        where: whereClause,
        include: {
          slots: {
            include: {
              slot: true,
              company: true
            }
          },
          bids: {
            include: {
              user: true,
              company: true,
              slot: true
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { startTime: 'desc' },
        skip,
        take
      }),
      prisma.auctionSession.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      message: 'Auction sessions retrieved successfully',
      data: {
        sessions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Get auction sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve auction sessions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Auction Session by ID
router.get('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Auction session ID is required'
      });
    }

    const auctionSession = await prisma.auctionSession.findUnique({
      where: { id },
      include: {
        slots: {
          include: {
            slot: true,
            company: true
          }
        },
        bids: {
          include: {
            user: true,
            company: true,
            slot: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!auctionSession) {
      return res.status(404).json({
        success: false,
        message: 'Auction session not found'
      });
    }

    return res.json({
      success: true,
      message: 'Auction session retrieved successfully',
      data: { auctionSession }
    });
  } catch (error) {
    console.error('Get auction session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve auction session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update Auction Session
router.put('/sessions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = auctionSessionSchema.partial().parse(req.body);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Auction session ID is required'
      });
    }

    // Validate time constraints if provided
    if (data.startTime && data.endTime) {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      
      if (startTime >= endTime) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    const updateData: any = { ...data };
    if (data.startTime) updateData.startTime = new Date(data.startTime);
    if (data.endTime) updateData.endTime = new Date(data.endTime);
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.reservePrice !== undefined) updateData.reservePrice = data.reservePrice || null;

    const auctionSession = await prisma.auctionSession.update({
      where: { id },
      data: updateData,
      include: {
        slots: {
          include: {
            slot: true,
            company: true
          }
        },
        bids: {
          include: {
            user: true,
            company: true,
            slot: true
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return res.json({
      success: true,
      message: 'Auction session updated successfully',
      data: { auctionSession }
    });
  } catch (error: any) {
    console.error('Update auction session error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Auction session not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to update auction session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start Auction Session
router.post('/sessions/:id/start', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Auction session ID is required'
      });
    }

    const auctionSession = await prisma.auctionSession.findUnique({
      where: { id },
      include: {
        slots: {
          include: {
            slot: true
          }
        }
      }
    });

    if (!auctionSession) {
      return res.status(404).json({
        success: false,
        message: 'Auction session not found'
      });
    }

    if (auctionSession.status !== 'SCHEDULED') {
      return res.status(400).json({
        success: false,
        message: 'Auction session can only be started from SCHEDULED status'
      });
    }

    // Update auction session status
    const updatedSession = await prisma.auctionSession.update({
      where: { id },
      data: {
        status: 'ACTIVE',
        actualStartTime: new Date()
      },
      include: {
        slots: {
          include: {
            slot: true,
            company: true
          }
        }
      }
    });

    // Update all associated slots to AUCTION_ACTIVE
    if (auctionSession.slots && auctionSession.slots.length > 0) {
      await prisma.slot.updateMany({
        where: {
          id: {
            in: auctionSession.slots.map((s: any) => s.slotId)
          }
        },
        data: {
          status: 'AUCTION_ACTIVE'
        }
      });
    }

    return res.json({
      success: true,
      message: 'Auction session started successfully',
      data: { auctionSession: updatedSession }
    });
  } catch (error) {
    console.error('Start auction session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to start auction session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Pause Auction Session
router.post('/sessions/:id/pause', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Auction session ID is required'
      });
    }

    const auctionSession = await prisma.auctionSession.findUnique({
      where: { id }
    });

    if (!auctionSession) {
      return res.status(404).json({
        success: false,
        message: 'Auction session not found'
      });
    }

    if (auctionSession.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Auction session can only be paused from ACTIVE status'
      });
    }

    const updatedSession = await prisma.auctionSession.update({
      where: { id },
      data: { status: 'PAUSED' }
    });

    return res.json({
      success: true,
      message: 'Auction session paused successfully',
      data: { auctionSession: updatedSession }
    });
  } catch (error) {
    console.error('Pause auction session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to pause auction session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resume Auction Session
router.post('/sessions/:id/resume', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Auction session ID is required'
      });
    }

    const auctionSession = await prisma.auctionSession.findUnique({
      where: { id }
    });

    if (!auctionSession) {
      return res.status(404).json({
        success: false,
        message: 'Auction session not found'
      });
    }

    if (auctionSession.status !== 'PAUSED') {
      return res.status(400).json({
        success: false,
        message: 'Auction session can only be resumed from PAUSED status'
      });
    }

    const updatedSession = await prisma.auctionSession.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });

    return res.json({
      success: true,
      message: 'Auction session resumed successfully',
      data: { auctionSession: updatedSession }
    });
  } catch (error) {
    console.error('Resume auction session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resume auction session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// End Auction Session
router.post('/sessions/:id/end', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Auction session ID is required'
      });
    }

    const auctionSession = await prisma.auctionSession.findUnique({
      where: { id },
      include: {
        slots: {
          include: {
            slot: true
          }
        }
      }
    });

    if (!auctionSession) {
      return res.status(404).json({
        success: false,
        message: 'Auction session not found'
      });
    }

    if (!['ACTIVE', 'PAUSED'].includes(auctionSession.status)) {
      return res.status(400).json({
        success: false,
        message: 'Auction session can only be ended from ACTIVE or PAUSED status'
      });
    }

    // Update auction session status
    const updatedSession = await prisma.auctionSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        actualEndTime: new Date()
      }
    });

    // Update all associated slots to OCCUPIED or AVAILABLE based on winning bids
    if (auctionSession.slots && auctionSession.slots.length > 0) {
      for (const slot of auctionSession.slots) {
        const winningBid = await prisma.bid.findFirst({
          where: {
            slotId: slot.slotId,
            status: 'WON'
          },
          orderBy: { amount: 'desc' }
        });

        await prisma.slot.update({
          where: { id: slot.slotId },
          data: {
            status: winningBid ? 'OCCUPIED' : 'AVAILABLE',
            currentSponsor: winningBid?.companyId || null,
            currentBid: winningBid?.amount || 0
          }
        });
      }
    }

    return res.json({
      success: true,
      message: 'Auction session ended successfully',
      data: { auctionSession: updatedSession }
    });
  } catch (error) {
    console.error('End auction session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to end auction session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Extend Auction Session
router.post('/sessions/:id/extend', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { duration } = req.body; // Duration in seconds

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Auction session ID is required'
      });
    }

    const auctionSession = await prisma.auctionSession.findUnique({
      where: { id }
    });

    if (!auctionSession) {
      return res.status(404).json({
        success: false,
        message: 'Auction session not found'
      });
    }

    if (auctionSession.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Auction session can only be extended when ACTIVE'
      });
    }

    if (auctionSession.extensions >= auctionSession.maxExtensions) {
      return res.status(400).json({
        success: false,
        message: 'Maximum number of extensions reached'
      });
    }

    const extendDuration = duration || auctionSession.extendDuration;
    const newEndTime = new Date(auctionSession.endTime.getTime() + (extendDuration * 1000));

    const updatedSession = await prisma.auctionSession.update({
      where: { id },
      data: {
        endTime: newEndTime,
        extensions: auctionSession.extensions + 1
      }
    });

    return res.json({
      success: true,
      message: 'Auction session extended successfully',
      data: { 
        auctionSession: updatedSession,
        extensionDuration: extendDuration,
        newEndTime
      }
    });
  } catch (error) {
    console.error('Extend auction session error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to extend auction session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enhanced Bid Placement with Advanced Validation
router.post('/bids', async (req: Request, res: Response) => {
  try {
    const data = bidValidationSchema.parse(req.body);

    // Get auction session for the slot
    const auctionSession = await prisma.auctionSession.findFirst({
      where: {
        slots: {
          some: {
            slotId: data.slotId
          }
        },
        status: 'ACTIVE'
      },
      include: {
        slots: {
          where: { slotId: data.slotId },
          include: { slot: true }
        }
      }
    });

    if (!auctionSession) {
      return res.status(400).json({
        success: false,
        message: 'No active auction session found for this slot'
      });
    }

    // Get slot details
    const slot = await prisma.slot.findUnique({
      where: { id: data.slotId },
      include: { company: true }
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    // Validate slot status
    if (slot.status !== 'AUCTION_ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Slot is not available for bidding'
      });
    }

    // Validate company eligibility
    const company = await prisma.company.findUnique({
      where: { id: data.companyId }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Validate user
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate bid amount
    if (data.amount < slot.reservePrice) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be at least ${slot.reservePrice}`
      });
    }

    if (data.amount <= slot.currentBid) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be higher than current bid of ${slot.currentBid}`
      });
    }

    // Check bid increment
    const minBidAmount = slot.currentBid + auctionSession.bidIncrement;
    if (data.amount < minBidAmount) {
      return res.status(400).json({
        success: false,
        message: `Bid amount must be at least ${minBidAmount} (current bid + increment)`
      });
    }

    // Create the bid
    const bid = await prisma.bid.create({
      data: {
        slotId: data.slotId,
        companyId: data.companyId,
        userId: data.userId,
        amount: data.amount,
        bidderInfo: data.bidderInfo,
        status: 'ACTIVE',
        auctionSessionId: auctionSession.id
      },
      include: {
        slot: true,
        company: true,
        user: true
      }
    });

    // Update slot with new current bid
    await prisma.slot.update({
      where: { id: data.slotId },
      data: {
        currentBid: data.amount,
        currentSponsor: data.companyId,
        totalBids: slot.totalBids + 1,
        lastBidTime: new Date()
      }
    });

    // Update previous bids to OUTBID status
    await prisma.bid.updateMany({
      where: {
        slotId: data.slotId,
        id: { not: bid.id },
        status: 'ACTIVE'
      },
      data: { status: 'OUTBID' }
    });

    // Send notifications to outbid users
    const outbidBids = await prisma.bid.findMany({
      where: {
        slotId: data.slotId,
        status: 'OUTBID',
        userId: { not: data.userId }
      },
      include: { user: true }
    });

    for (const outbidBid of outbidBids) {
      await prisma.auctionNotification.create({
        data: {
          auctionSessionId: auctionSession.id,
          type: 'BID_OUTBID',
          recipientType: 'USER',
          recipientId: outbidBid.userId,
          message: `You have been outbid on ${slot.slotNumber}. New bid: ${data.amount}`,
          priority: 'HIGH'
        }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      data: { bid }
    });
  } catch (error) {
    console.error('Place bid error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to place bid',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Auction Notifications
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const { auctionId, type, recipientType, recipientId, limit = '20', page = '1' } = req.query;
    
    const whereClause: any = {};
    if (auctionId) whereClause.auctionSessionId = auctionId;
    if (type) whereClause.type = type;
    if (recipientType) whereClause.recipientType = recipientType;
    if (recipientId) whereClause.recipientId = recipientId;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const [notifications, total] = await Promise.all([
      prisma.auctionNotification.findMany({
        where: whereClause,
        include: {
          auctionSession: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.auctionNotification.count({ where: whereClause })
    ]);

    return res.json({
      success: true,
      message: 'Auction notifications retrieved successfully',
      data: {
        notifications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Get auction notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve auction notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create Auction Notification
router.post('/notifications', async (req: Request, res: Response) => {
  try {
    const data = auctionNotificationSchema.parse(req.body);

    const notification = await prisma.auctionNotification.create({
      data: {
        auctionSessionId: data.auctionId,
        type: data.type,
        recipientType: data.recipientType,
        recipientId: data.recipientId || null,
        message: data.message,
        priority: data.priority
      },
      include: {
        auctionSession: true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Auction notification created successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Create auction notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create auction notification',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Active Auctions
router.get('/active', async (req: Request, res: Response) => {
  try {
    const activeAuctions = await prisma.auctionSession.findMany({
      where: {
        status: 'ACTIVE',
        startTime: { lte: new Date() },
        endTime: { gte: new Date() }
      },
      include: {
        slots: {
          include: {
            slot: {
              include: {
                company: true
              }
            },
            company: true
          }
        },
        bids: {
          where: { status: 'ACTIVE' },
          include: {
            user: true,
            company: true
          },
          orderBy: { amount: 'desc' }
        }
      },
      orderBy: { endTime: 'asc' }
    });

    return res.json({
      success: true,
      message: 'Active auctions retrieved successfully',
      data: { activeAuctions }
    });
  } catch (error) {
    console.error('Get active auctions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve active auctions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get Auction Statistics
router.get('/statistics', async (req: Request, res: Response) => {
  try {
    const { period = '7d' } = req.query;
    
    const now = new Date();
    let dateFrom: Date;
    
    switch (period) {
      case '1d':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    const [
      totalAuctions,
      activeAuctions,
      completedAuctions,
      totalBids,
      totalRevenue,
      averageBidAmount,
      topPerformingSlots,
      auctionTrends
    ] = await Promise.all([
      // Total auctions
      prisma.auctionSession.count({
        where: {
          createdAt: { gte: dateFrom }
        }
      }),
      
      // Active auctions
      prisma.auctionSession.count({
        where: {
          status: 'ACTIVE',
          createdAt: { gte: dateFrom }
        }
      }),
      
      // Completed auctions
      prisma.auctionSession.count({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: dateFrom }
        }
      }),
      
      // Total bids
      prisma.bid.count({
        where: {
          createdAt: { gte: dateFrom }
        }
      }),
      
      // Total revenue
      prisma.bid.aggregate({
        where: {
          status: 'WON',
          createdAt: { gte: dateFrom }
        },
        _sum: { amount: true }
      }),
      
      // Average bid amount
      prisma.bid.aggregate({
        where: {
          createdAt: { gte: dateFrom }
        },
        _avg: { amount: true }
      }),
      
      // Top performing slots
      prisma.bid.groupBy({
        by: ['slotId'],
        where: {
          createdAt: { gte: dateFrom }
        },
        _count: { slotId: true },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 10
      }),
      
      // Auction trends
      prisma.$queryRaw`
        SELECT 
          DATE(createdAt) as date,
          COUNT(*) as auctionCount,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount
        FROM auction_sessions 
        WHERE createdAt >= ${dateFrom}
        GROUP BY DATE(createdAt)
        ORDER BY date
      `
    ]);

    return res.json({
      success: true,
      message: 'Auction statistics retrieved successfully',
      data: {
        statistics: {
          period,
          dateRange: {
            start: dateFrom,
            end: now
          },
          summary: {
            totalAuctions,
            activeAuctions,
            completedAuctions,
            totalBids,
            totalRevenue: totalRevenue._sum.amount || 0,
            averageBidAmount: averageBidAmount._avg.amount || 0
          },
          topPerformingSlots: topPerformingSlots.map((slot: any) => ({
            slotId: slot.slotId,
            bidCount: slot._count.slotId,
            totalAmount: slot._sum.amount || 0
          })),
          auctionTrends: auctionTrends
        }
      }
    });
  } catch (error) {
    console.error('Get auction statistics error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve auction statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
