import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const router = express.Router();

// Validation middleware
const validateAnalyticsEvent = [
  body('eventType').isIn(['QR_SCAN', 'NFC_TAP', 'CONTENT_VIEW', 'CONTENT_LIKE', 'BID_PLACEMENT', 'AUCTION_VIEW', 'SLOT_VIEW', 'HOVER_INTERACTION', 'CLICK_INTERACTION']).withMessage('Invalid event type'),
  body('slotId').optional().isString().withMessage('Slot ID must be a string'),
  body('companyId').optional().isString().withMessage('Company ID must be a string'),
  body('userId').optional().isString().withMessage('User ID must be a string'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object'),
  body('sessionId').optional().isString().withMessage('Session ID must be a string'),
  body('deviceInfo').optional().isObject().withMessage('Device info must be an object')
];

/**
 * @route   GET /api/analytics/overview
 * @desc    Get analytics overview with key metrics
 * @access  Public
 */
router.get('/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, slotId, companyId } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    // Build where clause
    const where: any = {};
    if (Object.keys(dateFilter).length > 0) where.timestamp = dateFilter;
    if (slotId) where.slotId = slotId;
    if (companyId) where.companyId = companyId;

    const [
      totalEvents,
      eventsByType,
      eventsBySlot,
      eventsByCompany,
      recentEvents,
      topSlots,
      topCompanies
    ] = await Promise.all([
      // Total events
      prisma.analytics.count({ where }),
      
      // Events by type
      prisma.analytics.groupBy({
        by: ['eventType'],
        where,
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } }
      }),
      
      // Events by slot
      prisma.analytics.groupBy({
        by: ['slotId'],
        where: { ...where, slotId: { not: null } },
        _count: { slotId: true },
        orderBy: { _count: { slotId: 'desc' } },
        take: 10
      }),
      
      // Events by company
      prisma.analytics.groupBy({
        by: ['companyId'],
        where: { ...where, companyId: { not: null } },
        _count: { companyId: true },
        orderBy: { _count: { companyId: 'desc' } },
        take: 10
      }),
      
      // Recent events
      prisma.analytics.findMany({
        where,
        include: {
          slot: true,
          company: true,
          user: true
        },
        orderBy: { timestamp: 'desc' },
        take: 20
      }),
      
      // Top performing slots
      prisma.analytics.groupBy({
        by: ['slotId'],
        where: { ...where, slotId: { not: null } },
        _count: { slotId: true },
        orderBy: { _count: { slotId: 'desc' } },
        take: 5
      }),
      
      // Top performing companies
      prisma.analytics.groupBy({
        by: ['companyId'],
        where: { ...where, companyId: { not: null } },
        _count: { companyId: true },
        orderBy: { _count: { companyId: 'desc' } },
        take: 5
      })
    ]);

    // Get slot and company details for top performers
    const topSlotIds = topSlots.map(item => item.slotId).filter((id): id is string => id !== null);
    const topCompanyIds = topCompanies.map(item => item.companyId).filter((id): id is string => id !== null);

    const [topSlotDetails, topCompanyDetails] = await Promise.all([
      topSlotIds.length > 0 ? prisma.slot.findMany({
        where: { id: { in: topSlotIds } },
        select: { id: true, slotNumber: true, slotType: true, description: true }
      }) : [],
      topCompanyIds.length > 0 ? prisma.company.findMany({
        where: { id: { in: topCompanyIds } },
        select: { id: true, name: true, category: true, tier: true }
      }) : []
    ]);

    const overview = {
      summary: {
        totalEvents,
        dateRange: {
          start: startDate || null,
          end: endDate || null
        }
      },
      eventsByType: eventsByType.map(item => ({
        eventType: item.eventType,
        count: item._count.eventType
      })),
      topSlots: topSlots.map(item => {
        const slotDetail = topSlotDetails.find(s => s.id === item.slotId);
        return {
          slotId: item.slotId,
          eventCount: item._count.slotId,
          slotDetails: slotDetail || null
        };
      }),
      topCompanies: topCompanies.map(item => {
        const companyDetail = topCompanyDetails.find(c => c.id === item.companyId);
        return {
          companyId: item.companyId,
          eventCount: item._count.companyId,
          companyDetails: companyDetail || null
        };
      }),
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        eventType: event.eventType,
        timestamp: event.timestamp,
        slot: event.slot ? {
          id: event.slot.id,
          slotNumber: event.slot.slotNumber,
          slotType: event.slot.slotType
        } : null,
        company: event.company ? {
          id: event.company.id,
          name: event.company.name,
          category: event.company.category
        } : null,
        user: event.user ? {
          id: event.user.id,
          username: event.user.username,
          role: event.user.role
        } : null,
        metadata: event.metadata
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Analytics overview retrieved successfully',
      data: { overview }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics overview',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/analytics/events
 * @desc    Get analytics events with filtering and pagination
 * @access  Public
 */
router.get('/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      eventType, 
      slotId, 
      companyId, 
      userId, 
      startDate, 
      endDate, 
      page = '1', 
      limit = '50' 
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    // Build where clause
    const where: any = {};
    if (eventType) where.eventType = eventType;
    if (slotId) where.slotId = slotId;
    if (companyId) where.companyId = companyId;
    if (userId) where.userId = userId;
    if (Object.keys(dateFilter).length > 0) where.timestamp = dateFilter;

    const [events, total] = await Promise.all([
      prisma.analytics.findMany({
        where,
        include: {
          slot: true,
          company: true,
          user: true
        },
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' }
      }),
      prisma.analytics.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Analytics events retrieved successfully',
      data: {
        events: events.map(event => ({
          id: event.id,
          eventType: event.eventType,
          timestamp: event.timestamp,
          sessionId: event.sessionId,
          slot: event.slot ? {
            id: event.slot.id,
            slotNumber: event.slot.slotNumber,
            slotType: event.slot.slotType
          } : null,
          company: event.company ? {
            id: event.company.id,
            name: event.company.name,
            category: event.company.category
          } : null,
          user: event.user ? {
            id: event.user.id,
            username: event.user.username,
            role: event.user.role
          } : null,
          metadata: event.metadata,
          deviceInfo: event.deviceInfo
        })),
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
    logger.error('Error retrieving analytics events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics events',
      error: (error as Error).message
    });
  }
});

/**
 * @route   POST /api/analytics/events
 * @desc    Track analytics event
 * @access  Public
 */
router.post('/events', validateAnalyticsEvent, async (req: Request, res: Response): Promise<void> => {
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

    const { eventType, slotId, companyId, userId, metadata, sessionId, deviceInfo } = req.body;

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

    // Verify company exists if provided
    if (companyId) {
      const company = await prisma.company.findUnique({
        where: { id: companyId }
      });
      if (!company) {
        res.status(404).json({
          success: false,
          message: 'Company not found'
        });
        return;
      }
    }

    // Verify user exists if provided
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }
    }

    const event = await prisma.analytics.create({
      data: {
        eventType,
        slotId: slotId || undefined,
        companyId: companyId || undefined,
        userId: userId || undefined,
        metadata: metadata || {},
        sessionId: sessionId || undefined,
        deviceInfo: deviceInfo || undefined
      },
      include: {
        slot: true,
        company: true,
        user: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Analytics event tracked successfully',
      data: { event }
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error tracking analytics event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track analytics event',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/analytics/slots/:slotId
 * @desc    Get analytics for specific slot
 * @access  Public
 */
router.get('/slots/:slotId', [
  param('slotId').isString().withMessage('Invalid slot ID')
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

    const { slotId } = req.params;
    const { startDate, endDate, eventType } = req.query;

    if (!slotId) {
      res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
      return;
    }

    // Verify slot exists
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

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    // Build where clause
    const where: any = { slotId };
    if (eventType) where.eventType = eventType;
    if (Object.keys(dateFilter).length > 0) where.timestamp = dateFilter;

    const [
      totalEvents,
      eventsByType,
      recentEvents,
      hourlyStats
    ] = await Promise.all([
      // Total events
      prisma.analytics.count({ where }),
      
      // Events by type
      prisma.analytics.groupBy({
        by: ['eventType'],
        where,
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } }
      }),
      
      // Recent events
      prisma.analytics.findMany({
        where,
        include: {
          company: true,
          user: true
        },
        orderBy: { timestamp: 'desc' },
        take: 20
      }),
      
      // Hourly statistics (last 24 hours)
      prisma.$queryRaw`
        SELECT 
          strftime('%H', timestamp) as hour,
          COUNT(*) as event_count
        FROM analytics 
        WHERE slotId = ${slotId} 
          AND timestamp >= datetime('now', '-24 hours')
        GROUP BY strftime('%H', timestamp)
        ORDER BY hour
      `
    ]);

    const slotAnalytics = {
      slot: {
        id: slot.id,
        slotNumber: slot.slotNumber,
        slotType: slot.slotType,
        description: slot.description
      },
      summary: {
        totalEvents,
        dateRange: {
          start: startDate || null,
          end: endDate || null
        }
      },
      eventsByType: eventsByType.map(item => ({
        eventType: item.eventType,
        count: item._count.eventType
      })),
      hourlyStats: hourlyStats,
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        eventType: event.eventType,
        timestamp: event.timestamp,
        company: event.company ? {
          id: event.company.id,
          name: event.company.name,
          category: event.company.category
        } : null,
        user: event.user ? {
          id: event.user.id,
          username: event.user.username,
          role: event.user.role
        } : null,
        metadata: event.metadata
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Slot analytics retrieved successfully',
      data: { slotAnalytics }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving slot analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve slot analytics',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/analytics/companies/:companyId
 * @desc    Get analytics for specific company
 * @access  Public
 */
router.get('/companies/:companyId', [
  param('companyId').isString().withMessage('Invalid company ID')
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

    const { companyId } = req.params;
    const { startDate, endDate, eventType } = req.query;

    if (!companyId) {
      res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
      return;
    }

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Company not found'
      });
      return;
    }

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    // Build where clause
    const where: any = { companyId };
    if (eventType) where.eventType = eventType;
    if (Object.keys(dateFilter).length > 0) where.timestamp = dateFilter;

    const [
      totalEvents,
      eventsByType,
      eventsBySlot,
      recentEvents
    ] = await Promise.all([
      // Total events
      prisma.analytics.count({ where }),
      
      // Events by type
      prisma.analytics.groupBy({
        by: ['eventType'],
        where,
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } }
      }),
      
      // Events by slot
      prisma.analytics.groupBy({
        by: ['slotId'],
        where: { ...where, slotId: { not: null } },
        _count: { slotId: true },
        orderBy: { _count: { slotId: 'desc' } }
      }),
      
      // Recent events
      prisma.analytics.findMany({
        where,
        include: {
          slot: true,
          user: true
        },
        orderBy: { timestamp: 'desc' },
        take: 20
      })
    ]);

    // Get slot details for events by slot
    const slotIds = eventsBySlot.map(item => item.slotId).filter((id): id is string => id !== null);
    const slotDetails = slotIds.length > 0 ? await prisma.slot.findMany({
      where: { id: { in: slotIds } },
      select: { id: true, slotNumber: true, slotType: true, description: true }
    }) : [];

    const companyAnalytics = {
      company: {
        id: company.id,
        name: company.name,
        category: company.category,
        tier: company.tier
      },
      summary: {
        totalEvents,
        dateRange: {
          start: startDate || null,
          end: endDate || null
        }
      },
      eventsByType: eventsByType.map(item => ({
        eventType: item.eventType,
        count: item._count.eventType
      })),
      eventsBySlot: eventsBySlot.map(item => {
        const slotDetail = slotDetails.find(s => s.id === item.slotId);
        return {
          slotId: item.slotId,
          eventCount: item._count.slotId,
          slotDetails: slotDetail || null
        };
      }),
      recentEvents: recentEvents.map(event => ({
        id: event.id,
        eventType: event.eventType,
        timestamp: event.timestamp,
        slot: event.slot ? {
          id: event.slot.id,
          slotNumber: event.slot.slotNumber,
          slotType: event.slot.slotType
        } : null,
        user: event.user ? {
          id: event.user.id,
          username: event.user.username,
          role: event.user.role
        } : null,
        metadata: event.metadata
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Company analytics retrieved successfully',
      data: { companyAnalytics }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving company analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve company analytics',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/analytics/performance
 * @desc    Get performance metrics and KPIs
 * @access  Public
 */
router.get('/performance', async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '24h' } = req.query;

    // Calculate time range based on period
    let timeRange: string;
    switch (period) {
      case '1h':
        timeRange = "datetime('now', '-1 hour')";
        break;
      case '24h':
        timeRange = "datetime('now', '-24 hours')";
        break;
      case '7d':
        timeRange = "datetime('now', '-7 days')";
        break;
      case '30d':
        timeRange = "datetime('now', '-30 days')";
        break;
      default:
        timeRange = "datetime('now', '-24 hours')";
    }

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '1h':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const [
      totalEvents,
      uniqueUsers,
      topEvents,
      slotPerformance,
      companyPerformance,
      hourlyTrends
    ] = await Promise.all([
      // Total events in period
      prisma.analytics.count({
        where: {
          timestamp: {
            gte: startDate
          }
        }
      }),
      
      // Unique users in period
      prisma.analytics.groupBy({
        by: ['userId'],
        where: {
          timestamp: {
            gte: startDate
          },
          userId: {
            not: null
          }
        }
      }).then(result => result.length),
      
      // Top event types
      prisma.analytics.groupBy({
        by: ['eventType'],
        where: {
          timestamp: {
            gte: startDate
          }
        },
        _count: {
          eventType: true
        },
        orderBy: {
          _count: {
            eventType: 'desc'
          }
        },
        take: 5
      }),
      
      // Slot performance
      prisma.slot.findMany({
        include: {
          _count: {
            select: {
              analytics: {
                where: {
                  timestamp: {
                    gte: startDate
                  }
                }
              }
            }
          }
        },
        orderBy: {
          analytics: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      
      // Company performance
      prisma.company.findMany({
        include: {
          _count: {
            select: {
              analytics: {
                where: {
                  timestamp: {
                    gte: startDate
                  }
                }
              }
            }
          }
        },
        orderBy: {
          analytics: {
            _count: 'desc'
          }
        },
        take: 10
      }),
      
      // Hourly trends (last 24 hours)
      prisma.analytics.groupBy({
        by: ['timestamp'],
        where: {
          timestamp: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          timestamp: true
        }
      })
    ]);

    const performance = {
      period,
      summary: {
        totalEvents: totalEvents || 0,
        uniqueUsers: uniqueUsers || 0,
        averageEventsPerUser: totalEvents / Math.max(uniqueUsers || 1, 1)
      },
      topEvents: topEvents.map(item => ({
        eventType: item.eventType,
        count: item._count.eventType
      })),
      slotPerformance: slotPerformance.map(item => ({
        slotNumber: item.slotNumber,
        slotType: item.slotType,
        eventCount: item._count.analytics || 0,
        uniqueUsers: 0 // This would need a separate query for unique users per slot
      })),
      companyPerformance: companyPerformance.map(item => ({
        name: item.name,
        category: item.category,
        tier: item.tier,
        eventCount: item._count.analytics || 0,
        uniqueUsers: 0 // This would need a separate query for unique users per company
      })),
      hourlyTrends: hourlyTrends.map(item => ({
        hour: new Date(item.timestamp).getHours(),
        eventCount: item._count.timestamp || 0,
        uniqueUsers: 0 // This would need a separate query for unique users per hour
      }))
    };

    const response: ApiResponse = {
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: { performance }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance metrics',
      error: (error as Error).message
    });
  }
});

export default router;
