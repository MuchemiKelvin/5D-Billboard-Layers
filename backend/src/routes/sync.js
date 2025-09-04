const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Slot = require('../models/Slot');
const Block = require('../models/Block');
const Analytics = require('../models/Analytics');
const { logger } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');
const { getConnectedDevices, getDeviceRooms } = require('../socket/handlers');

// Get system sync status
router.get('/status', async (req, res) => {
  try {
    const connectedDevices = getConnectedDevices();
    const deviceRooms = getDeviceRooms();
    
    const syncStatus = {
      timestamp: new Date(),
      connectedDevices: Array.from(connectedDevices.values()).map(device => ({
        deviceType: device.deviceType,
        deviceId: device.deviceId,
        location: device.location,
        connectedAt: device.connectedAt,
        lastSeen: device.lastSeen,
        status: 'connected'
      })),
      totalConnections: connectedDevices.size,
      deviceTypes: Array.from(connectedDevices.values()).reduce((acc, device) => {
        acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
        return acc;
      }, {}),
      syncHealth: {
        isHealthy: connectedDevices.size > 0,
        lastSync: new Date(),
        syncLatency: '<1s' // Target latency
      }
    };
    
    res.json({
      success: true,
      data: syncStatus
    });
  } catch (error) {
    logger.error('❌ Failed to get sync status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
});

// Get device sync data
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { lastSyncTime } = req.query;
    
    const deviceRooms = getDeviceRooms();
    const deviceSocketId = deviceRooms.get(deviceId);
    
    if (!deviceSocketId) {
      return res.status(404).json({
        success: false,
        message: 'Device not connected'
      });
    }
    
    // Get updates since last sync
    const updates = await getUpdatesSince(lastSyncTime);
    
    // Get current system status
    const currentBlock = await Block.getActiveBlock();
    const activeSlots = await Slot.getActiveSlots();
    
    const syncData = {
      deviceId,
      timestamp: new Date(),
      updates,
      currentSystem: {
        block: currentBlock ? {
          name: currentBlock.name,
          status: currentBlock.status,
          currentSlotIndex: currentBlock.currentSlotIndex,
          totalSlots: currentBlock.totalSlots,
          progress: currentBlock.progress
        } : null,
        activeSlots: activeSlots.length,
        totalSlots: 24
      },
      syncHealth: {
        isHealthy: true,
        lastSync: new Date(),
        syncLatency: '<1s'
      }
    };
    
    res.json({
      success: true,
      data: syncData
    });
    
    logger.info(`🔄 Sync data sent to device: ${deviceId}`);
    
  } catch (error) {
    logger.error('❌ Failed to get device sync data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get device sync data',
      error: error.message
    });
  }
});

// Force sync to specific device
router.post('/device/:deviceId/sync', [
  authenticateToken,
  body('force').optional().isBoolean()
], async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { force = false } = req.body;
    
    const deviceRooms = getDeviceRooms();
    const deviceSocketId = deviceRooms.get(deviceId);
    
    if (!deviceSocketId) {
      return res.status(404).json({
        success: false,
        message: 'Device not connected'
      });
    }
    
    // Get current system status
    const currentBlock = await Block.getActiveBlock();
    const activeSlots = await Slot.getActiveSlots();
    
    const syncData = {
      type: 'forced_sync',
      timestamp: new Date(),
      currentSystem: {
        block: currentBlock ? {
          name: currentBlock.name,
          status: currentBlock.status,
          currentSlotIndex: currentBlock.currentSlotIndex,
          totalSlots: currentBlock.totalSlots,
          progress: currentBlock.progress
        } : null,
        activeSlots: activeSlots.length,
        totalSlots: 24
      }
    };
    
    // Emit sync event to device
    const io = require('../server').io;
    io.to(deviceSocketId).emit('force_sync', syncData);
    
    logger.info(`🔄 Forced sync sent to device: ${deviceId}`);
    
    res.json({
      success: true,
      message: 'Sync command sent to device',
      data: { deviceId, timestamp: new Date() }
    });
    
  } catch (error) {
    logger.error('❌ Failed to force sync device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to force sync device',
      error: error.message
    });
  }
});

// Get sync history
router.get('/history', [
  authenticateToken
], async (req, res) => {
  try {
    const { page = 1, limit = 50, deviceId, startDate, endDate } = req.query;
    
    const filter = {};
    if (deviceId) filter.deviceId = deviceId;
    if (startDate && endDate) {
      filter['metadata.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const syncEvents = await Analytics.find({
      ...filter,
      eventType: { $in: ['slot_view', 'qr_scan', 'ar_activation', 'nfc_trigger'] }
    })
    .sort({ 'metadata.timestamp': -1 })
    .populate('slotId', 'slotNumber')
    .populate('sponsorId', 'name company')
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Analytics.countDocuments({
      ...filter,
      eventType: { $in: ['slot_view', 'qr_scan', 'ar_activation', 'nfc_trigger'] }
    });
    
    const syncHistory = syncEvents.map(event => ({
      id: event._id,
      eventType: event.eventType,
      deviceType: event.deviceType,
      deviceId: event.deviceId,
      slotNumber: event.slotNumber,
      sponsor: event.sponsorId?.name || 'No Sponsor',
      timestamp: event.metadata.timestamp,
      location: event.location,
      context: event.context
    }));
    
    res.json({
      success: true,
      data: syncHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    logger.error('❌ Failed to get sync history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync history',
      error: error.message
    });
  }
});

// Get sync performance metrics
router.get('/performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = {};
    if (startDate && endDate) {
      matchStage['metadata.timestamp'] = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get sync performance by device type
    const devicePerformance = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$deviceType',
          totalEvents: { $sum: 1 },
          avgResponseTime: { $avg: '$performance.responseTime' },
          avgLoadTime: { $avg: '$performance.loadTime' },
          errorCount: { $sum: { $cond: [{ $eq: ['$performance.success', false] }, 1, 0] } },
          successRate: {
            $multiply: [
              { $divide: [{ $sum: { $cond: [{ $eq: ['$performance.success', true] }, 1, 0] } }, { $sum: 1 }] },
              100
            ]
          }
        }
      },
      { $sort: { totalEvents: -1 } }
    ]);
    
    // Get sync latency distribution
    const latencyDistribution = await Analytics.aggregate([
      { $match: { ...matchStage, 'performance.responseTime': { $exists: true } } },
      {
        $group: {
          _id: null,
          avgLatency: { $avg: '$performance.responseTime' },
          minLatency: { $min: '$performance.responseTime' },
          maxLatency: { $max: '$performance.responseTime' },
          latencyPercentiles: {
            p50: { $percentile: { input: '$performance.responseTime', p: 0.5 } },
            p95: { $percentile: { input: '$performance.responseTime', p: 0.95 } },
            p99: { $percentile: { input: '$performance.responseTime', p: 0.99 } }
          }
        }
      }
    ]);
    
    const performanceMetrics = {
      period: { startDate, endDate },
      devicePerformance,
      latencyMetrics: latencyDistribution[0] || {},
      syncHealth: {
        targetLatency: '<1s',
        currentAvgLatency: latencyDistribution[0]?.avgLatency || 0,
        isHealthy: (latencyDistribution[0]?.avgLatency || 0) < 1000
      }
    };
    
    res.json({
      success: true,
      data: performanceMetrics
    });
    
  } catch (error) {
    logger.error('❌ Failed to get sync performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync performance',
      error: error.message
    });
  }
});

// Get connected devices list
router.get('/devices', [
  authenticateToken
], async (req, res) => {
  try {
    const connectedDevices = getConnectedDevices();
    const deviceRooms = getDeviceRooms();
    
    const devices = Array.from(connectedDevices.values()).map(device => ({
      deviceType: device.deviceType,
      deviceId: device.deviceId,
      location: device.location,
      capabilities: device.capabilities,
      connectedAt: device.connectedAt,
      lastSeen: device.lastSeen,
      status: 'connected',
      uptime: Date.now() - device.connectedAt.getTime(),
      socketId: deviceRooms.get(device.deviceId)
    }));
    
    res.json({
      success: true,
      data: {
        devices,
        totalDevices: devices.length,
        deviceTypes: devices.reduce((acc, device) => {
          acc[device.deviceType] = (acc[device.deviceType] || 0) + 1;
          return acc;
        }, {}),
        timestamp: new Date()
      }
    });
    
  } catch (error) {
    logger.error('❌ Failed to get connected devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get connected devices',
      error: error.message
    });
  }
});

// Disconnect device
router.post('/device/:deviceId/disconnect', [
  authenticateToken
], async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const deviceRooms = getDeviceRooms();
    const deviceSocketId = deviceRooms.get(deviceId);
    
    if (!deviceSocketId) {
      return res.status(404).json({
        success: false,
        message: 'Device not connected'
      });
    }
    
    // Force disconnect device
    const io = require('../server').io;
    io.to(deviceSocketId).emit('force_disconnect', {
      reason: 'Admin requested disconnect',
      timestamp: new Date()
    });
    
    // Close socket connection
    io.sockets.sockets.get(deviceSocketId)?.disconnect(true);
    
    logger.info(`🔌 Admin disconnected device: ${deviceId}`);
    
    res.json({
      success: true,
      message: 'Device disconnected successfully',
      data: { deviceId, timestamp: new Date() }
    });
    
  } catch (error) {
    logger.error('❌ Failed to disconnect device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect device',
      error: error.message
    });
  }
});

// Helper function to get updates since last sync
const getUpdatesSince = async (lastSyncTime) => {
  try {
    const updates = {
      slots: [],
      blocks: [],
      analytics: []
    };

    if (lastSyncTime) {
      const since = new Date(lastSyncTime);
      
      // Get updated slots
      updates.slots = await Slot.find({
        updatedAt: { $gt: since }
      }).select('slotNumber slotType category sponsor isActive');

      // Get updated blocks
      updates.blocks = await Block.find({
        updatedAt: { $gt: since }
      }).select('name status currentSlotIndex totalSlots');

      // Get recent analytics
      updates.analytics = await Analytics.find({
        'metadata.timestamp': { $gt: since }
      }).select('eventType slotNumber deviceType').limit(100);
    }

    return updates;
  } catch (error) {
    logger.error('❌ Failed to get updates:', error);
    return { slots: [], blocks: [], analytics: [] };
  }
};

module.exports = router;
