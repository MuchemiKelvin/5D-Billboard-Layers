import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Helper function to convert BigInt values to numbers
const convertBigIntToNumber = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return Number(obj);
  if (Array.isArray(obj)) return obj.map(convertBigIntToNumber);
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToNumber(value);
    }
    return converted;
  }
  return obj;
};

// Validation schemas
const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['1h', '24h', '7d', '30d', '90d']).optional(),
  slotId: z.string().optional(),
  companyId: z.string().optional(),
  eventType: z.string().optional(),
  limit: z.string().transform(Number).optional(),
  page: z.string().transform(Number).optional()
});

const performanceMetricsSchema = z.object({
  period: z.enum(['1h', '24h', '7d', '30d', '90d']).default('24h'),
  includeDetails: z.string().transform((val: string) => val === 'true').optional()
});

// Advanced Analytics Overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const { startDate, endDate, period = '24h' } = query;

    // Calculate date range based on period
    const now = new Date();
    let dateFrom: Date;
    
    switch (period) {
      case '1h':
        dateFrom = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const whereClause: any = {
      timestamp: {
        gte: startDate ? new Date(startDate) : dateFrom,
        lte: endDate ? new Date(endDate) : now
      }
    };

    // Get comprehensive analytics overview
    const [
      totalEvents,
      uniqueUsers,
      eventsByType,
      topSlots,
      topCompanies,
      recentEvents,
      hourlyTrends,
      conversionMetrics
    ] = await Promise.all([
      // Total events
      prisma.analytics.count({ where: whereClause }),
      
      // Unique users
      prisma.analytics.findMany({
        where: whereClause,
        select: { sessionId: true },
        distinct: ['sessionId']
      }),
      
      // Events by type
      prisma.analytics.groupBy({
        by: ['eventType'],
        where: whereClause,
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } }
      }),
      
      // Top performing slots
      prisma.analytics.groupBy({
        by: ['slotId'],
        where: { ...whereClause, slotId: { not: null } },
        _count: { slotId: true },
        orderBy: { _count: { slotId: 'desc' } },
        take: 10
      }),
      
      // Top performing companies
      prisma.analytics.groupBy({
        by: ['companyId'],
        where: { ...whereClause, companyId: { not: null } },
        _count: { companyId: true },
        orderBy: { _count: { companyId: 'desc' } },
        take: 10
      }),
      
      // Recent events
      prisma.analytics.findMany({
        where: whereClause,
        include: {
          slot: true,
          company: true,
          user: true
        },
        orderBy: { timestamp: 'desc' },
        take: 20
      }),
      
      // Hourly trends (simplified)
      Promise.resolve([]),
      
      // Conversion metrics
      prisma.analytics.groupBy({
        by: ['eventType'],
        where: {
          ...whereClause,
          eventType: { in: ['SLOT_VIEW', 'QR_SCAN', 'BID_PLACEMENT', 'NFC_TAP'] }
        },
        _count: { eventType: true }
      })
    ]);

    // Calculate conversion rates
    const viewEvents = Number(conversionMetrics.find((m: any) => m.eventType === 'SLOT_VIEW')?._count.eventType || 0);
    const scanEvents = Number(conversionMetrics.find((m: any) => m.eventType === 'QR_SCAN')?._count.eventType || 0);
    const bidEvents = Number(conversionMetrics.find((m: any) => m.eventType === 'BID_PLACEMENT')?._count.eventType || 0);
    const nfcEvents = Number(conversionMetrics.find((m: any) => m.eventType === 'NFC_TAP')?._count.eventType || 0);

    const conversionRates = {
      viewToScan: viewEvents > 0 ? (scanEvents / viewEvents * 100).toFixed(2) : '0.00',
      viewToBid: viewEvents > 0 ? (bidEvents / viewEvents * 100).toFixed(2) : '0.00',
      scanToBid: scanEvents > 0 ? (bidEvents / scanEvents * 100).toFixed(2) : '0.00',
      nfcEngagement: viewEvents > 0 ? (nfcEvents / viewEvents * 100).toFixed(2) : '0.00'
    };

    res.json({
      success: true,
      message: 'Advanced analytics overview retrieved successfully',
      data: {
        overview: {
          period,
          dateRange: {
            start: dateFrom,
            end: now
          },
          summary: {
            totalEvents: Number(totalEvents),
            uniqueUsers: uniqueUsers.length,
            averageEventsPerUser: uniqueUsers.length > 0 ? (Number(totalEvents) / uniqueUsers.length).toFixed(2) : '0.00'
          },
          eventsByType: eventsByType.map((event: any) => ({
            eventType: event.eventType,
            count: Number(event._count.eventType),
            percentage: totalEvents > 0 ? ((Number(event._count.eventType) / Number(totalEvents)) * 100).toFixed(2) : '0.00'
          })),
          topSlots: topSlots.map((slot: any) => ({
            slotId: slot.slotId,
            eventCount: Number(slot._count.slotId),
            percentage: totalEvents > 0 ? ((Number(slot._count.slotId) / Number(totalEvents)) * 100).toFixed(2) : '0.00'
          })),
          topCompanies: topCompanies.map((company: any) => ({
            companyId: company.companyId,
            eventCount: Number(company._count.companyId),
            percentage: totalEvents > 0 ? ((Number(company._count.companyId) / Number(totalEvents)) * 100).toFixed(2) : '0.00'
          })),
          recentEvents: recentEvents.map((event: any) => ({
            id: event.id,
            eventType: event.eventType,
            timestamp: event.timestamp,
            slot: event.slot ? { id: event.slot.id, slotNumber: event.slot.slotNumber } : null,
            company: event.company ? { id: event.company.id, name: event.company.name } : null,
            user: event.user ? { id: event.user.id, email: event.user.email } : null,
            metadata: event.metadata
          })),
          hourlyTrends: hourlyTrends,
          conversionRates
        }
      }
    });
  } catch (error) {
    console.error('Advanced analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve advanced analytics overview',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Real-time Performance Metrics
router.get('/performance', async (req: Request, res: Response) => {
  try {
    const query = performanceMetricsSchema.parse(req.query);
    const { period, includeDetails = false } = query;

    const now = new Date();
    let dateFrom: Date;
    
    switch (period) {
      case '1h':
        dateFrom = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const whereClause = {
      timestamp: {
        gte: dateFrom,
        lte: now
      }
    };

    // Get performance metrics
    const [
      totalEvents,
      uniqueUsers,
      topEvents,
      slotPerformance,
      companyPerformance,
      hourlyTrends,
      devicePerformance,
      engagementMetrics
    ] = await Promise.all([
      // Total events
      prisma.analytics.count({ where: whereClause }),
      
      // Unique users
      prisma.analytics.findMany({
        where: whereClause,
        select: { sessionId: true },
        distinct: ['sessionId']
      }),
      
      // Top events
      prisma.analytics.groupBy({
        by: ['eventType'],
        where: whereClause,
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } },
        take: 10
      }),
      
      // Slot performance
      prisma.analytics.groupBy({
        by: ['slotId'],
        where: { ...whereClause, slotId: { not: null } },
        _count: { slotId: true },
        orderBy: { _count: { slotId: 'desc' } },
        take: 10
      }),
      
      // Company performance
      prisma.analytics.groupBy({
        by: ['companyId'],
        where: { ...whereClause, companyId: { not: null } },
        _count: { companyId: true },
        orderBy: { _count: { companyId: 'desc' } },
        take: 10
      }),
      
      // Hourly trends
      prisma.$queryRaw`
        SELECT 
          strftime('%H', timestamp) as hour,
          COUNT(*) as event_count
        FROM analytics 
        WHERE timestamp >= ${dateFrom} AND timestamp <= ${now}
        GROUP BY strftime('%H', timestamp)
        ORDER BY hour
      `,
      
      // Device performance
      prisma.analytics.groupBy({
        by: ['deviceInfo'],
        where: whereClause,
        _count: { deviceInfo: true },
        orderBy: { _count: { deviceInfo: 'desc' } },
        take: 5
      }),
      
      // Engagement metrics
      prisma.analytics.groupBy({
        by: ['eventType'],
        where: {
          ...whereClause,
          eventType: { in: ['SLOT_VIEW', 'QR_SCAN', 'BID_PLACEMENT', 'NFC_TAP', 'HOVER_INTERACTION', 'CLICK_INTERACTION'] }
        },
        _count: { eventType: true }
      })
    ]);

    // Calculate engagement rates
    const viewEvents = Number(engagementMetrics.find((m: any) => m.eventType === 'SLOT_VIEW')?._count.eventType || 0);
    const interactionEvents = engagementMetrics
      .filter((m: any) => ['QR_SCAN', 'BID_PLACEMENT', 'NFC_TAP', 'HOVER_INTERACTION', 'CLICK_INTERACTION'].includes(m.eventType))
      .reduce((sum: any, m: any) => sum + Number(m._count.eventType), 0);

    const engagementRate = viewEvents > 0 ? ((interactionEvents / viewEvents) * 100).toFixed(2) : '0.00';

    const performance = {
      period,
      dateRange: {
        start: dateFrom,
        end: now
      },
      summary: {
        totalEvents: Number(totalEvents),
        uniqueUsers: uniqueUsers.length,
        averageEventsPerUser: uniqueUsers.length > 0 ? (Number(totalEvents) / uniqueUsers.length).toFixed(2) : '0.00',
        engagementRate: `${engagementRate}%`
      },
      topEvents: topEvents.map((event: any) => ({
        eventType: event.eventType,
        count: Number(event._count.eventType),
        percentage: totalEvents > 0 ? ((Number(event._count.eventType) / Number(totalEvents)) * 100).toFixed(2) : '0.00'
      })),
      slotPerformance: slotPerformance.map((slot: any) => ({
        slotId: slot.slotId,
        eventCount: Number(slot._count.slotId),
        percentage: totalEvents > 0 ? ((Number(slot._count.slotId) / Number(totalEvents)) * 100).toFixed(2) : '0.00'
      })),
      companyPerformance: companyPerformance.map((company: any) => ({
        companyId: company.companyId,
        eventCount: Number(company._count.companyId),
        percentage: totalEvents > 0 ? ((Number(company._count.companyId) / Number(totalEvents)) * 100).toFixed(2) : '0.00'
      })),
      hourlyTrends: hourlyTrends,
      devicePerformance: devicePerformance.map((device: any) => ({
        deviceInfo: device.deviceInfo,
        eventCount: Number(device._count.deviceInfo),
        percentage: totalEvents > 0 ? ((Number(device._count.deviceInfo) / Number(totalEvents)) * 100).toFixed(2) : '0.00'
      }))
    };

    // Add detailed metrics if requested
    if (includeDetails) {
      const [detailedSlotMetrics, detailedCompanyMetrics] = await Promise.all([
        // Detailed slot metrics
        prisma.$queryRaw`
          SELECT 
            s.id as slotId,
            s.slotNumber,
            COUNT(ae.id) as totalEvents,
            COUNT(DISTINCT ae.sessionId) as uniqueSessions,
            AVG(CASE WHEN ae.metadata LIKE '%duration%' THEN 
              CAST(JSON_EXTRACT(ae.metadata, '$.duration') AS REAL) 
            END) as avgDuration
          FROM Slot s
          LEFT JOIN AnalyticsEvent ae ON s.id = ae.slotId 
            AND ae.timestamp >= ${dateFrom} AND ae.timestamp <= ${now}
          GROUP BY s.id, s.slotNumber
          ORDER BY totalEvents DESC
        `,
        
        // Detailed company metrics
        prisma.$queryRaw`
          SELECT 
            c.id as companyId,
            c.name as companyName,
            COUNT(ae.id) as totalEvents,
            COUNT(DISTINCT ae.sessionId) as uniqueSessions,
            COUNT(CASE WHEN ae.eventType = 'BID_PLACEMENT' THEN 1 END) as bidEvents
          FROM Company c
          LEFT JOIN AnalyticsEvent ae ON c.id = ae.companyId 
            AND ae.timestamp >= ${dateFrom} AND ae.timestamp <= ${now}
          GROUP BY c.id, c.name
          ORDER BY totalEvents DESC
        `
      ]);

      (performance as any).detailedMetrics = {
        slotMetrics: detailedSlotMetrics,
        companyMetrics: detailedCompanyMetrics
      };
    }

    res.json({
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: { performance }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve performance metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Viewer Engagement Analytics
router.get('/engagement', async (req: Request, res: Response) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const { startDate, endDate, period = '24h' } = query;

    const now = new Date();
    let dateFrom: Date;
    
    switch (period) {
      case '1h':
        dateFrom = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const whereClause = {
      timestamp: {
        gte: startDate ? new Date(startDate) : dateFrom,
        lte: endDate ? new Date(endDate) : now
      }
    };

    // Get engagement analytics
    const [
      engagementEvents,
      sessionAnalytics,
      interactionFunnel,
      timeOnSite,
      bounceRate
    ] = await Promise.all([
      // Engagement events
      prisma.analytics.groupBy({
        by: ['eventType'],
        where: {
          ...whereClause,
          eventType: { in: ['SLOT_VIEW', 'QR_SCAN', 'BID_PLACEMENT', 'NFC_TAP', 'HOVER_INTERACTION', 'CLICK_INTERACTION', 'CONTENT_VIEW'] }
        },
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } }
      }),
      
      // Session analytics
      prisma.$queryRaw`
        SELECT 
          sessionId,
          COUNT(*) as eventCount,
          MIN(timestamp) as sessionStart,
          MAX(timestamp) as sessionEnd,
          COUNT(DISTINCT slotId) as uniqueSlots,
          COUNT(DISTINCT companyId) as uniqueCompanies
        FROM analytics 
        WHERE timestamp >= ${dateFrom} AND timestamp <= ${now}
        GROUP BY sessionId
        ORDER BY eventCount DESC
        LIMIT 100
      `,
      
      // Interaction funnel
      prisma.$queryRaw`
        SELECT 
          'SLOT_VIEW' as step,
          COUNT(*) as count
        FROM analytics 
        WHERE eventType = 'SLOT_VIEW' AND timestamp >= ${dateFrom} AND timestamp <= ${now}
        UNION ALL
        SELECT 
          'QR_SCAN' as step,
          COUNT(*) as count
        FROM analytics 
        WHERE eventType = 'QR_SCAN' AND timestamp >= ${dateFrom} AND timestamp <= ${now}
        UNION ALL
        SELECT 
          'BID_PLACEMENT' as step,
          COUNT(*) as count
        FROM analytics 
        WHERE eventType = 'BID_PLACEMENT' AND timestamp >= ${dateFrom} AND timestamp <= ${now}
        ORDER BY 
          CASE step
            WHEN 'SLOT_VIEW' THEN 1
            WHEN 'QR_SCAN' THEN 2
            WHEN 'BID_PLACEMENT' THEN 3
          END
      `,
      
      // Time on site
      prisma.$queryRaw`
        SELECT 
          AVG(
            (julianday(MAX(timestamp)) - julianday(MIN(timestamp))) * 24 * 60 * 60
          ) as avgSessionDuration
        FROM analytics 
        WHERE timestamp >= ${dateFrom} AND timestamp <= ${now}
        GROUP BY sessionId
      `,
      
      // Bounce rate (sessions with only 1 event)
      prisma.$queryRaw`
        SELECT 
          COUNT(*) as totalSessions,
          COUNT(CASE WHEN eventCount = 1 THEN 1 END) as bouncedSessions
        FROM (
          SELECT sessionId, COUNT(*) as eventCount
          FROM analytics 
          WHERE timestamp >= ${dateFrom} AND timestamp <= ${now}
          GROUP BY sessionId
        )
      `
    ]);

    // Calculate engagement metrics
    const totalEngagementEvents = engagementEvents.reduce((sum: any, event: any) => sum + Number(event._count.eventType), 0);
    const viewEvents = Number(engagementEvents.find((e: any) => e.eventType === 'SLOT_VIEW')?._count.eventType || 0);
    const interactionEvents = engagementEvents
      .filter((e: any) => ['QR_SCAN', 'BID_PLACEMENT', 'NFC_TAP', 'HOVER_INTERACTION', 'CLICK_INTERACTION'].includes(e.eventType))
      .reduce((sum: any, event: any) => sum + Number(event._count.eventType), 0);

    const engagementRate = viewEvents > 0 ? ((interactionEvents / viewEvents) * 100).toFixed(2) : '0.00';
    const avgSessionDuration = (timeOnSite as any)[0]?.avgSessionDuration || 0;
    const bounceRateData = (bounceRate as any)[0];
    const bounceRatePercent = bounceRateData?.totalSessions > 0 
      ? ((bounceRateData.bouncedSessions / bounceRateData.totalSessions) * 100).toFixed(2) 
      : '0.00';

    res.json({
      success: true,
      message: 'Viewer engagement analytics retrieved successfully',
      data: {
        engagement: {
          period,
          dateRange: {
            start: dateFrom,
            end: now
          },
          summary: {
            totalEngagementEvents,
            engagementRate: `${engagementRate}%`,
            avgSessionDuration: `${avgSessionDuration.toFixed(2)} seconds`,
            bounceRate: `${bounceRatePercent}%`
          },
          engagementEvents: engagementEvents.map((event: any) => ({
            eventType: event.eventType,
            count: Number(event._count.eventType),
            percentage: totalEngagementEvents > 0 ? ((Number(event._count.eventType) / totalEngagementEvents) * 100).toFixed(2) : '0.00'
          })),
          sessionAnalytics: sessionAnalytics,
          interactionFunnel: interactionFunnel,
          metrics: {
            avgSessionDuration: avgSessionDuration,
            bounceRate: parseFloat(bounceRatePercent),
            totalSessions: bounceRateData?.totalSessions || 0,
            bouncedSessions: bounceRateData?.bouncedSessions || 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Engagement analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve engagement analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Conversion Tracking
router.get('/conversion', async (req: Request, res: Response) => {
  try {
    const query = analyticsQuerySchema.parse(req.query);
    const { startDate, endDate, period = '24h' } = query;

    const now = new Date();
    let dateFrom: Date;
    
    switch (period) {
      case '1h':
        dateFrom = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const whereClause = {
      timestamp: {
        gte: startDate ? new Date(startDate) : dateFrom,
        lte: endDate ? new Date(endDate) : now
      }
    };

    // Get conversion analytics
    const [
      conversionEvents,
      slotConversions,
      companyConversions,
      conversionFunnel,
      revenueMetrics
    ] = await Promise.all([
      // Conversion events
      prisma.analytics.groupBy({
        by: ['eventType'],
        where: {
          ...whereClause,
          eventType: { in: ['SLOT_VIEW', 'QR_SCAN', 'BID_PLACEMENT', 'NFC_TAP'] }
        },
        _count: { eventType: true },
        orderBy: { _count: { eventType: 'desc' } }
      }),
      
      // Slot conversions
      prisma.$queryRaw`
        SELECT 
          slotId,
          COUNT(CASE WHEN eventType = 'SLOT_VIEW' THEN 1 END) as views,
          COUNT(CASE WHEN eventType = 'QR_SCAN' THEN 1 END) as scans,
          COUNT(CASE WHEN eventType = 'BID_PLACEMENT' THEN 1 END) as bids,
          COUNT(CASE WHEN eventType = 'NFC_TAP' THEN 1 END) as nfcTaps
        FROM analytics 
        WHERE timestamp >= ${dateFrom} AND timestamp <= ${now}
          AND slotId IS NOT NULL
        GROUP BY slotId
        ORDER BY views DESC
      `,
      
      // Company conversions
      prisma.$queryRaw`
        SELECT 
          companyId,
          COUNT(CASE WHEN eventType = 'SLOT_VIEW' THEN 1 END) as views,
          COUNT(CASE WHEN eventType = 'QR_SCAN' THEN 1 END) as scans,
          COUNT(CASE WHEN eventType = 'BID_PLACEMENT' THEN 1 END) as bids,
          COUNT(CASE WHEN eventType = 'NFC_TAP' THEN 1 END) as nfcTaps
        FROM analytics 
        WHERE timestamp >= ${dateFrom} AND timestamp <= ${now}
          AND companyId IS NOT NULL
        GROUP BY companyId
        ORDER BY views DESC
      `,
      
      // Conversion funnel
      prisma.$queryRaw`
        SELECT 
          'SLOT_VIEW' as step,
          COUNT(*) as count,
          100.0 as percentage
        FROM analytics 
        WHERE eventType = 'SLOT_VIEW' AND timestamp >= ${dateFrom} AND timestamp <= ${now}
        UNION ALL
        SELECT 
          'QR_SCAN' as step,
          COUNT(*) as count,
          CASE WHEN (SELECT COUNT(*) FROM analytics WHERE eventType = 'SLOT_VIEW' AND timestamp >= ${dateFrom} AND timestamp <= ${now}) > 0
            THEN (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM analytics WHERE eventType = 'SLOT_VIEW' AND timestamp >= ${dateFrom} AND timestamp <= ${now}))
            ELSE 0.0
          END as percentage
        FROM analytics 
        WHERE eventType = 'QR_SCAN' AND timestamp >= ${dateFrom} AND timestamp <= ${now}
        UNION ALL
        SELECT 
          'BID_PLACEMENT' as step,
          COUNT(*) as count,
          CASE WHEN (SELECT COUNT(*) FROM analytics WHERE eventType = 'SLOT_VIEW' AND timestamp >= ${dateFrom} AND timestamp <= ${now}) > 0
            THEN (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM analytics WHERE eventType = 'SLOT_VIEW' AND timestamp >= ${dateFrom} AND timestamp <= ${now}))
            ELSE 0.0
          END as percentage
        FROM analytics 
        WHERE eventType = 'BID_PLACEMENT' AND timestamp >= ${dateFrom} AND timestamp <= ${now}
        ORDER BY 
          CASE step
            WHEN 'SLOT_VIEW' THEN 1
            WHEN 'QR_SCAN' THEN 2
            WHEN 'BID_PLACEMENT' THEN 3
          END
      `,
      
      // Revenue metrics
      prisma.$queryRaw`
        SELECT 
          COUNT(*) as totalBids,
          AVG(CAST(JSON_EXTRACT(metadata, '$.amount') AS REAL)) as avgBidAmount,
          MAX(CAST(JSON_EXTRACT(metadata, '$.amount') AS REAL)) as maxBidAmount,
          MIN(CAST(JSON_EXTRACT(metadata, '$.amount') AS REAL)) as minBidAmount
        FROM analytics 
        WHERE eventType = 'BID_PLACEMENT' 
          AND timestamp >= ${dateFrom} AND timestamp <= ${now}
          AND metadata LIKE '%amount%'
      `
    ]);

    // Calculate conversion rates
    const viewEvents = Number(conversionEvents.find((e: any) => e.eventType === 'SLOT_VIEW')?._count.eventType || 0);
    const scanEvents = Number(conversionEvents.find((e: any) => e.eventType === 'QR_SCAN')?._count.eventType || 0);
    const bidEvents = Number(conversionEvents.find((e: any) => e.eventType === 'BID_PLACEMENT')?._count.eventType || 0);
    const nfcEvents = Number(conversionEvents.find((e: any) => e.eventType === 'NFC_TAP')?._count.eventType || 0);

    const conversionRates = {
      viewToScan: viewEvents > 0 ? ((scanEvents / viewEvents) * 100).toFixed(2) : '0.00',
      viewToBid: viewEvents > 0 ? ((bidEvents / viewEvents) * 100).toFixed(2) : '0.00',
      scanToBid: scanEvents > 0 ? ((bidEvents / scanEvents) * 100).toFixed(2) : '0.00',
      nfcEngagement: viewEvents > 0 ? ((nfcEvents / viewEvents) * 100).toFixed(2) : '0.00'
    };

    res.json({
      success: true,
      message: 'Conversion tracking analytics retrieved successfully',
      data: {
        conversion: {
          period,
          dateRange: {
            start: dateFrom,
            end: now
          },
          summary: {
            totalViews: viewEvents,
            totalScans: scanEvents,
            totalBids: bidEvents,
            totalNfcTaps: nfcEvents,
            conversionRates
          },
          conversionEvents: conversionEvents.map((event: any) => ({
            eventType: event.eventType,
            count: Number(event._count.eventType)
          })),
          slotConversions: slotConversions,
          companyConversions: companyConversions,
          conversionFunnel: conversionFunnel,
          revenueMetrics: (revenueMetrics as any)[0] || {
            totalBids: 0,
            avgBidAmount: 0,
            maxBidAmount: 0,
            minBidAmount: 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve conversion tracking analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Real-time Dashboard Data
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Get real-time dashboard data
    const [
      currentStats,
      hourlyStats,
      topPerformingSlots,
      topPerformingCompanies,
      recentActivity,
      systemHealth
    ] = await Promise.all([
      // Current stats (last 24h)
      prisma.analytics.groupBy({
        by: ['eventType'],
        where: {
          timestamp: { gte: last24h, lte: now }
        },
        _count: { eventType: true }
      }),
      
      // Hourly stats (last 24h)
      prisma.$queryRaw`
        SELECT 
          strftime('%H', timestamp) as hour,
          COUNT(*) as eventCount,
          COUNT(DISTINCT sessionId) as uniqueSessions
        FROM analytics 
        WHERE timestamp >= ${last24h} AND timestamp <= ${now}
        GROUP BY strftime('%H', timestamp)
        ORDER BY hour
      `,
      
      // Top performing slots
      prisma.analytics.groupBy({
        by: ['slotId'],
        where: {
          timestamp: { gte: last24h, lte: now },
          slotId: { not: null }
        },
        _count: { slotId: true },
        orderBy: { _count: { slotId: 'desc' } },
        take: 5
      }),
      
      // Top performing companies
      prisma.analytics.groupBy({
        by: ['companyId'],
        where: {
          timestamp: { gte: last24h, lte: now },
          companyId: { not: null }
        },
        _count: { companyId: true },
        orderBy: { _count: { companyId: 'desc' } },
        take: 5
      }),
      
      // Recent activity
      prisma.analytics.findMany({
        where: {
          timestamp: { gte: lastHour, lte: now }
        },
        include: {
          slot: true,
          company: true
        },
        orderBy: { timestamp: 'desc' },
        take: 20
      }),
      
      // System health
      prisma.device.findMany({
        select: {
          id: true,
          deviceType: true,
          status: true,
          lastSeen: true
        }
      })
    ]);

    // Calculate real-time metrics
    const totalEvents24h = currentStats.reduce((sum: any, stat: any) => sum + Number(stat._count.eventType), 0);
    const totalEvents1h = recentActivity.length;
    const onlineDevices = systemHealth.filter((device: any) => device.status === 'ONLINE').length;
    const totalDevices = systemHealth.length;

    res.json({
      success: true,
      message: 'Real-time dashboard data retrieved successfully',
      data: {
        dashboard: {
          timestamp: now,
          realTimeMetrics: {
            totalEvents24h,
            totalEvents1h,
            onlineDevices,
            totalDevices,
            systemHealth: `${onlineDevices}/${totalDevices} devices online`
          },
          hourlyStats: hourlyStats,
          topPerformingSlots: topPerformingSlots.map((slot: any) => ({
            slotId: slot.slotId,
            eventCount: Number(slot._count.slotId)
          })),
          topPerformingCompanies: topPerformingCompanies.map((company: any) => ({
            companyId: company.companyId,
            eventCount: Number(company._count.companyId)
          })),
          recentActivity: recentActivity.map((activity: any) => ({
            id: activity.id,
            eventType: activity.eventType,
            timestamp: activity.timestamp,
            slot: activity.slot ? { id: activity.slot.id, slotNumber: activity.slot.slotNumber } : null,
            company: activity.company ? { id: activity.company.id, name: activity.company.name } : null,
            metadata: activity.metadata
          })),
          systemHealth: systemHealth.map((device: any) => ({
            id: device.id,
            deviceType: device.deviceType,
            status: device.status,
            lastSeen: device.lastSeen
          }))
        }
      }
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
