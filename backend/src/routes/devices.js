const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Mock device database
let devices = [
  {
    deviceId: 'beamer-001',
    deviceType: 'beamer',
    capabilities: {
      refreshRate: 60,
      resolution: { width: 1920, height: 1080 },
      syncPriority: 'high',
      displayModes: ['normal', 'fullscreen', 'presentation'],
      features: ['projection', 'calibration', 'keystone']
    },
    isPrimary: true,
    lastSeen: new Date(),
    status: 'online',
    syncLatency: 15,
    displayMode: 'normal',
    location: 'Main Hall',
    ipAddress: '192.168.1.100',
    userAgent: 'BeamerOS/2.1'
  },
  {
    deviceId: 'ipad-001',
    deviceType: 'ipad',
    capabilities: {
      refreshRate: 120,
      resolution: { width: 1024, height: 1366 },
      syncPriority: 'medium',
      displayModes: ['normal', 'portrait', 'landscape'],
      features: ['touch', 'gyroscope', 'gps', 'battery']
    },
    isPrimary: false,
    lastSeen: new Date(),
    status: 'online',
    syncLatency: 45,
    displayMode: 'portrait',
    location: 'Walking Billboard 1',
    ipAddress: '192.168.1.101',
    userAgent: 'iPadOS/17.0'
  },
  {
    deviceId: 'ipad-002',
    deviceType: 'ipad',
    capabilities: {
      refreshRate: 120,
      resolution: { width: 1024, height: 1366 },
      syncPriority: 'medium',
      displayModes: ['normal', 'portrait', 'landscape'],
      features: ['touch', 'gyroscope', 'gps', 'battery']
    },
    isPrimary: false,
    lastSeen: new Date(),
    status: 'online',
    syncLatency: 52,
    displayMode: 'landscape',
    location: 'Walking Billboard 2',
    ipAddress: '192.168.1.102',
    userAgent: 'iPadOS/17.0'
  },
  {
    deviceId: 'billboard-001',
    deviceType: 'billboard',
    capabilities: {
      refreshRate: 30,
      resolution: { width: 1920, height: 1080 },
      syncPriority: 'medium',
      displayModes: ['normal', 'billboard', 'advertising'],
      features: ['led', 'weather_protection', 'power_management']
    },
    isPrimary: false,
    lastSeen: new Date(),
    status: 'online',
    syncLatency: 78,
    displayMode: 'billboard',
    location: 'Outdoor Display',
    ipAddress: '192.168.1.103',
    userAgent: 'BillboardOS/1.5'
  }
];

// Device health data
let deviceHealth = {};

// Validation rules
const validateDevice = [
  body('deviceId').isString().notEmpty(),
  body('deviceType').isIn(['beamer', 'ipad', 'billboard']),
  body('capabilities').isObject(),
  body('isPrimary').isBoolean().optional()
];

const validateDeviceConfig = [
  body('config').isObject(),
  body('config.*').isObject().optional()
];

// GET /api/devices - Get all devices
router.get('/', async (req, res) => {
  try {
    logger.info('GET /api/devices - Retrieved device list', { count: devices.length });
    res.json(devices);
  } catch (error) {
    logger.error('GET /api/devices - Error retrieving devices', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve devices' });
  }
});

// GET /api/devices/:id - Get specific device
router.get('/:id', async (req, res) => {
  try {
    const device = devices.find(d => d.deviceId === req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    logger.info('GET /api/devices/:id - Retrieved device', { deviceId: req.params.id });
    res.json(device);
  } catch (error) {
    logger.error('GET /api/devices/:id - Error retrieving device', { 
      deviceId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to retrieve device' });
  }
});

// POST /api/devices - Register new device
router.post('/', validateDevice, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId, deviceType, capabilities, isPrimary = false } = req.body;

    // Check if device already exists
    if (devices.find(d => d.deviceId === deviceId)) {
      return res.status(409).json({ error: 'Device already registered' });
    }

    const newDevice = {
      deviceId,
      deviceType,
      capabilities,
      isPrimary,
      lastSeen: new Date(),
      status: 'online',
      syncLatency: 0,
      displayMode: 'normal',
      location: req.body.location || 'Unknown',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    devices.push(newDevice);

    // Initialize health monitoring
    deviceHealth[deviceId] = {
      status: 'healthy',
      metrics: {
        uptime: 0,
        temperature: 25,
        memoryUsage: 0,
        cpuUsage: 0,
        networkLatency: 0,
        syncLatency: 0,
        lastSync: new Date()
      },
      alerts: [],
      lastCheck: new Date()
    };

    logger.info('POST /api/devices - Device registered', { deviceId, deviceType });
    res.status(201).json(newDevice);
  } catch (error) {
    logger.error('POST /api/devices - Error registering device', { error: error.message });
    res.status(500).json({ error: 'Failed to register device' });
  }
});

// PUT /api/devices/:id - Update device
router.put('/:id', validateDevice, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const deviceIndex = devices.findIndex(d => d.deviceId === req.params.id);
    if (deviceIndex === -1) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const updatedDevice = {
      ...devices[deviceIndex],
      ...req.body,
      lastSeen: new Date()
    };

    devices[deviceIndex] = updatedDevice;

    logger.info('PUT /api/devices/:id - Device updated', { deviceId: req.params.id });
    res.json(updatedDevice);
  } catch (error) {
    logger.error('PUT /api/devices/:id - Error updating device', { 
      deviceId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// DELETE /api/devices/:id - Remove device
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const deviceIndex = devices.findIndex(d => d.deviceId === req.params.id);
    if (deviceIndex === -1) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const removedDevice = devices.splice(deviceIndex, 1)[0];
    delete deviceHealth[req.params.id];

    logger.info('DELETE /api/devices/:id - Device removed', { deviceId: req.params.id });
    res.json({ message: 'Device removed successfully', device: removedDevice });
  } catch (error) {
    logger.error('DELETE /api/devices/:id - Error removing device', { 
      deviceId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

// POST /api/devices/:id/heartbeat - Device heartbeat
router.post('/:id/heartbeat', async (req, res) => {
  try {
    const device = devices.find(d => d.deviceId === req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Update device status
    device.lastSeen = new Date();
    device.status = 'online';
    device.syncLatency = req.body.syncLatency || device.syncLatency;
    device.displayMode = req.body.displayMode || device.displayMode;

    // Update health metrics
    if (deviceHealth[req.params.id]) {
      deviceHealth[req.params.id].lastCheck = new Date();
      deviceHealth[req.params.id].metrics.syncLatency = device.syncLatency;
    }

    logger.info('POST /api/devices/:id/heartbeat - Device heartbeat', { deviceId: req.params.id });
    res.json({ status: 'ok', timestamp: new Date() });
  } catch (error) {
    logger.error('POST /api/devices/:id/heartbeat - Error processing heartbeat', { 
      deviceId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to process heartbeat' });
  }
});

// GET /api/devices/:id/health - Get device health
router.get('/:id/health', async (req, res) => {
  try {
    const health = deviceHealth[req.params.id];
    if (!health) {
      return res.status(404).json({ error: 'Device health not found' });
    }

    res.json(health);
  } catch (error) {
    logger.error('GET /api/devices/:id/health - Error retrieving device health', { 
      deviceId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to retrieve device health' });
  }
});

// POST /api/devices/:id/health - Update device health
router.post('/:id/health', async (req, res) => {
  try {
    const device = devices.find(d => d.deviceId === req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const { metrics, alerts, status } = req.body;

    if (!deviceHealth[req.params.id]) {
      deviceHealth[req.params.id] = {
        status: 'healthy',
        metrics: {},
        alerts: [],
        lastCheck: new Date()
      };
    }

    // Update health data
    if (metrics) {
      deviceHealth[req.params.id].metrics = {
        ...deviceHealth[req.params.id].metrics,
        ...metrics,
        lastSync: new Date()
      };
    }

    if (alerts) {
      deviceHealth[req.params.id].alerts = alerts;
    }

    if (status) {
      deviceHealth[req.params.id].status = status;
    }

    deviceHealth[req.params.id].lastCheck = new Date();

    logger.info('POST /api/devices/:id/health - Device health updated', { deviceId: req.params.id });
    res.json(deviceHealth[req.params.id]);
  } catch (error) {
    logger.error('POST /api/devices/:id/health - Error updating device health', { 
      deviceId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to update device health' });
  }
});

// GET /api/devices/type/:type - Get devices by type
router.get('/type/:type', async (req, res) => {
  try {
    const deviceType = req.params.type;
    const filteredDevices = devices.filter(d => d.deviceType === deviceType);

    logger.info('GET /api/devices/type/:type - Retrieved devices by type', { 
      deviceType, 
      count: filteredDevices.length 
    });
    res.json(filteredDevices);
  } catch (error) {
    logger.error('GET /api/devices/type/:type - Error retrieving devices by type', { 
      deviceType: req.params.type, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to retrieve devices by type' });
  }
});

// GET /api/devices/status/:status - Get devices by status
router.get('/status/:status', async (req, res) => {
  try {
    const status = req.params.status;
    const filteredDevices = devices.filter(d => d.status === status);

    logger.info('GET /api/devices/status/:status - Retrieved devices by status', { 
      status, 
      count: filteredDevices.length 
    });
    res.json(filteredDevices);
  } catch (error) {
    logger.error('GET /api/devices/status/:status - Error retrieving devices by status', { 
      status: req.params.status, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to retrieve devices by status' });
  }
});

// POST /api/devices/:id/disconnect - Disconnect device
router.post('/:id/disconnect', async (req, res) => {
  try {
    const device = devices.find(d => d.deviceId === req.params.id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    device.status = 'offline';
    device.lastSeen = new Date();

    logger.info('POST /api/devices/:id/disconnect - Device disconnected', { deviceId: req.params.id });
    res.json({ message: 'Device disconnected successfully', device });
  } catch (error) {
    logger.error('POST /api/devices/:id/disconnect - Error disconnecting device', { 
      deviceId: req.params.id, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to disconnect device' });
  }
});

// GET /api/devices/overview - Get devices overview
router.get('/overview', async (req, res) => {
  try {
    const overview = {
      total: devices.length,
      byType: {
        beamer: devices.filter(d => d.deviceType === 'beamer').length,
        ipad: devices.filter(d => d.deviceType === 'ipad').length,
        billboard: devices.filter(d => d.deviceType === 'billboard').length
      },
      byStatus: {
        online: devices.filter(d => d.status === 'online').length,
        offline: devices.filter(d => d.status === 'offline').length,
        syncing: devices.filter(d => d.status === 'syncing').length
      },
      averageLatency: devices.reduce((sum, d) => sum + d.syncLatency, 0) / devices.length,
      lastUpdated: new Date()
    };

    logger.info('GET /api/devices/overview - Retrieved devices overview');
    res.json(overview);
  } catch (error) {
    logger.error('GET /api/devices/overview - Error retrieving devices overview', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve devices overview' });
  }
});

module.exports = router;
