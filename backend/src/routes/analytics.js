const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Analytics = require('../models/Analytics');
const Slot = require('../models/Slot');
const Sponsor = require('../models/Sponsor');
const Block = require('../models/Block');
const { logger } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

// Get analytics overview
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage['metadata.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get event counts
    const eventCounts = await Analytics.getEventCounts(startDate, endDate);
    
    // Get device stats
    const deviceStats = await Analytics.getDeviceStats(startDate, endDate);
    
    // Get hourly stats
    const hourlyStats = await Analytics.getHourlyStats(startDate, endDate);
    
    // Calculate totals
    const totalEvents = eventCounts.reduce((sum, event) => sum + event.count, 0);
    const totalViews = eventCounts.find(e => e._id === 'slot_view')?.count || 0;
    const totalScans = eventCounts.find(e => e._id === 'qr_scan')?.count || 0;
    const totalARActivations = eventCounts.find(e => e._id === 'ar_activation')?.count || 0;
    
    const overview = {
      period: { startDate, endDate },
      totals: {
        events: totalEvents,
        views: totalViews,
        scans: totalScans,
        arActivations: totalARActivations,
        engagementRate: totalViews > 0 ? ((totalScans + totalARActivations) / totalViews) * 100 : 0
      },
      eventBreakdown: eventCounts,
      deviceBreakdown: deviceStats,
      hourlyTrends: hourlyStats
    };
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    logger.error('❌ Failed to get analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics overview',
      error: error.message
    });
  }
});

// Get slot performance analytics
router.get('/slots/performance', async (req, res) => {
  try {
    const { startDate, endDate, limit = 24 } = req.query;
    
    const slots = await Slot.find()
      .populate('sponsor')
      .sort({ slotNumber: 1 })
      .limit(parseInt(limit));
    
    const slotPerformance = await Promise.all(
      slots.map(async (slot) => {
        const performance = await Analytics.getSlotPerformance(slot._id, startDate, endDate);
        
        return {
          slotNumber: slot.slotNumber,
          slotType: slot.slotType,
          sponsor: slot.sponsor?.name || 'No Sponsor',
          viewCount: slot.viewCount,
          scanCount: slot.scanCount,
          arActivationCount: slot.arActivationCount,
          engagementRate: slot.viewCount > 0 ? ((slot.scanCount + slot.arActivationCount) / slot.viewCount) * 100 : 0,
          performance: performance
        };
      })
    );
    
    res.json({
      success: true,
      data: slotPerformance
    });
  } catch (error) {
    logger.error('❌ Failed to get slot performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get slot performance',
      error: error.message
    });
  }
});

// Get sponsor performance analytics
router.get('/sponsors/performance', async (req, res) => {
  try {
    const { startDate, endDate, limit = 20 } = req.query;
    
    const sponsors = await Sponsor.find({ isActive: true })
      .sort({ totalViews: -1 })
      .limit(parseInt(limit));
    
    const sponsorPerformance = await Promise.all(
      sponsors.map(async (sponsor) => {
        const performance = await Analytics.getSponsorPerformance(sponsor._id, startDate, endDate);
        
        return {
          id: sponsor._id,
          name: sponsor.name,
          company: sponsor.company,
          category: sponsor.category,
          tier: sponsor.tier,
          totalViews: sponsor.totalViews,
          totalScans: sponsor.totalScans,
          totalARActivations: sponsor.totalARActivations,
          averageEngagement: sponsor.averageEngagement,
          engagementRate: sponsor.engagementRate,
          performance: performance
        };
      })
    );
    
    res.json({
      success: true,
      data: sponsorPerformance
    });
  } catch (error) {
    logger.error('❌ Failed to get sponsor performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sponsor performance',
      error: error.message
    });
  }
});

// Get real-time analytics
router.get('/realtime', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Get recent events
    const recentEvents = await Analytics.find({
      'metadata.timestamp': { $gte: oneHourAgo }
    })
    .sort({ 'metadata.timestamp': -1 })
    .limit(100)
    .populate('slotId', 'slotNumber')
    .populate('sponsorId', 'name company');
    
    // Get current system status
    const activeSlots = await Slot.getActiveSlots();
    const currentBlock = await Block.getActiveBlock();
    
    const realtimeData = {
      timestamp: now,
      lastHour: {
        events: recentEvents.length,
        views: recentEvents.filter(e => e.eventType === 'slot_view').length,
        scans: recentEvents.filter(e => e.eventType === 'qr_scan').length,
        arActivations: recentEvents.filter(e => e.eventType === 'ar_activation').length
      },
      currentSystem: {
        activeSlots: activeSlots.length,
        currentBlock: currentBlock?.name || 'None',
        totalSlots: currentBlock?.totalSlots || 0
      },
      recentEvents: recentEvents.map(event => ({
        id: event._id,
        eventType: event.eventType,
        slotNumber: event.slotNumber,
        sponsor: event.sponsorId?.name || 'No Sponsor',
        deviceType: event.deviceType,
        timestamp: event.metadata.timestamp
      }))
    };
    
    res.json({
      success: true,
      data: realtimeData
    });
  } catch (error) {
    logger.error('❌ Failed to get real-time analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time analytics',
      error: error.message
    });
  }
});

// Get device analytics
router.get('/devices', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const deviceStats = await Analytics.getDeviceStats(startDate, endDate);
    
    // Get detailed device information
    const deviceDetails = await Promise.all(
      deviceStats.map(async (device) => {
        const deviceEvents = await Analytics.find({
          deviceType: device._id,
          ...(startDate && endDate && {
            'metadata.timestamp': {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          })
        })
        .select('eventType slotNumber metadata.timestamp')
        .sort({ 'metadata.timestamp': -1 })
        .limit(50);
        
        return {
          deviceType: device._id,
          totalEvents: device.count,
          eventTypes: device.eventTypes,
          recentActivity: deviceEvents.map(event => ({
            eventType: event.eventType,
            slotNumber: event.slotNumber,
            timestamp: event.metadata.timestamp
          }))
        };
      })
    );
    
    res.json({
      success: true,
      data: deviceDetails
    });
  } catch (error) {
    logger.error('❌ Failed to get device analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device analytics',
      error: error.message
    });
  }
});

// Get time-based analytics
router.get('/timeline', async (req, res) => {
  try {
    const { startDate, endDate, interval = 'hour' } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage['metadata.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    let groupStage;
    switch (interval) {
      case 'hour':
        groupStage = {
          _id: {
            year: { $year: '$metadata.timestamp' },
            month: { $month: '$metadata.timestamp' },
            day: { $dayOfMonth: '$metadata.timestamp' },
            hour: { $hour: '$metadata.timestamp' }
          }
        };
        break;
      case 'day':
        groupStage = {
          _id: {
            year: { $year: '$metadata.timestamp' },
            month: { $month: '$metadata.timestamp' },
            day: { $dayOfMonth: '$metadata.timestamp' }
          }
        };
        break;
      case 'week':
        groupStage = {
          _id: {
            year: { $year: '$metadata.timestamp' },
            week: { $week: '$metadata.timestamp' }
          }
        };
        break;
      default:
        groupStage = {
          _id: {
            year: { $year: '$metadata.timestamp' },
            month: { $month: '$metadata.timestamp' },
            day: { $dayOfMonth: '$metadata.timestamp' }
          }
        };
    }
    
    const timelineData = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          ...groupStage,
          totalEvents: { $sum: 1 },
          views: { $sum: { $cond: [{ $eq: ['$eventType', 'slot_view'] }, 1, 0] } },
          scans: { $sum: { $cond: [{ $eq: ['$eventType', 'qr_scan'] }, 1, 0] } },
          arActivations: { $sum: { $cond: [{ $eq: ['$eventType', 'ar_activation'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]);
    
    res.json({
      success: true,
      data: timelineData
    });
  } catch (error) {
    logger.error('❌ Failed to get timeline analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get timeline analytics',
      error: error.message
    });
  }
});

// Export analytics data
router.get('/export', [
  authenticateToken,
  body('format').isIn(['json', 'csv']).withMessage('Valid export format is required'),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('eventTypes').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { format, startDate, endDate, eventTypes } = req.body;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage['metadata.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (eventTypes && eventTypes.length > 0) {
      matchStage.eventType = { $in: eventTypes };
    }
    
    const analyticsData = await Analytics.find(matchStage)
      .populate('slotId', 'slotNumber')
      .populate('sponsorId', 'name company')
      .populate('blockId', 'name')
      .sort({ 'metadata.timestamp': -1 });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = analyticsData.map(event => ({
        timestamp: event.metadata.timestamp,
        eventType: event.eventType,
        slotNumber: event.slotNumber,
        sponsor: event.sponsorId?.name || 'No Sponsor',
        deviceType: event.deviceType,
        deviceId: event.deviceId,
        location: event.location
      }));
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics_${startDate}_${endDate}.csv`);
      
      // Simple CSV conversion
      const csv = csvData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      ).join('\n');
      
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: analyticsData
      });
    }
    
    logger.info(`📊 Exported analytics data: ${format} format`);
    
  } catch (error) {
    logger.error('❌ Failed to export analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics',
      error: error.message
    });
  }
});

// Get custom analytics query
router.post('/query', [
  authenticateToken,
  body('pipeline').isArray().withMessage('Valid aggregation pipeline is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { pipeline } = req.body;
    
    // Validate pipeline stages
    const validStages = ['$match', '$group', '$sort', '$limit', '$skip', '$project', '$lookup'];
    const isValidPipeline = pipeline.every(stage => 
      Object.keys(stage).some(key => validStages.includes(key))
    );
    
    if (!isValidPipeline) {
      return res.status(400).json({
        success: false,
        message: 'Invalid aggregation pipeline'
      });
    }
    
    const result = await Analytics.aggregate(pipeline);
    
    res.json({
      success: true,
      data: result
    });
    
    logger.info(`🔍 Custom analytics query executed: ${pipeline.length} stages`);
    
  } catch (error) {
    logger.error('❌ Failed to execute custom query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute custom query',
      error: error.message
    });
  }
});

module.exports = router;
