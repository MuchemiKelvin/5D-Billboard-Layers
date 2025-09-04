const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Mock iPad configurations
let ipadConfigs = {
  'ipad-001': {
    orientation: 'portrait',
    brightness: 80,
    autoLock: false,
    batteryOptimization: true,
    touchSensitivity: 'medium',
    hapticFeedback: true,
    location: 'Walking Billboard 1',
    lastLocation: { lat: 40.7128, lng: -74.0060 },
    batteryLevel: 85,
    isCharging: false,
    walkingSpeed: 0,
    isWalking: false
  },
  'ipad-002': {
    orientation: 'landscape',
    brightness: 75,
    autoLock: false,
    batteryOptimization: true,
    touchSensitivity: 'high',
    hapticFeedback: true,
    location: 'Walking Billboard 2',
    lastLocation: { lat: 40.7589, lng: -73.9851 },
    batteryLevel: 92,
    isCharging: false,
    walkingSpeed: 0,
    isWalking: false
  }
};

// Mock location history
let locationHistory = {};

// Validation rules
const validateIPadConfig = [
  body('orientation').isIn(['portrait', 'landscape', 'auto']),
  body('brightness').isInt({ min: 0, max: 100 }),
  body('autoLock').isBoolean(),
  body('batteryOptimization').isBoolean(),
  body('touchSensitivity').isIn(['low', 'medium', 'high']),
  body('hapticFeedback').isBoolean()
];

const validateLocation = [
  body('latitude').isFloat({ min: -90, max: 90 }),
  body('longitude').isFloat({ min: -180, max: 180 }),
  body('accuracy').isFloat({ min: 0 }).optional(),
  body('timestamp').isISO8601().optional()
];

// GET /api/ipad/config/:deviceId - Get iPad configuration
router.get('/config/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const config = ipadConfigs[deviceId];

    if (!config) {
      return res.status(404).json({ error: 'iPad configuration not found' });
    }

    logger.info('GET /api/ipad/config/:deviceId - Retrieved iPad config', { deviceId });
    res.json(config);
  } catch (error) {
    logger.error('GET /api/ipad/config/:deviceId - Error retrieving iPad config', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to retrieve iPad configuration' });
  }
});

// PUT /api/ipad/config/:deviceId - Update iPad configuration
router.put('/config/:deviceId', authenticateToken, requireRole(['admin', 'operator']), validateIPadConfig, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId } = req.params;
    const updates = req.body;

    if (!ipadConfigs[deviceId]) {
      ipadConfigs[deviceId] = {
        orientation: 'portrait',
        brightness: 80,
        autoLock: false,
        batteryOptimization: true,
        touchSensitivity: 'medium',
        hapticFeedback: true,
        location: 'Unknown',
        lastLocation: { lat: 0, lng: 0 },
        batteryLevel: 100,
        isCharging: false,
        walkingSpeed: 0,
        isWalking: false
      };
    }

    // Update configuration
    ipadConfigs[deviceId] = {
      ...ipadConfigs[deviceId],
      ...updates
    };

    logger.info('PUT /api/ipad/config/:deviceId - Updated iPad config', { deviceId, updates });
    res.json(ipadConfigs[deviceId]);
  } catch (error) {
    logger.error('PUT /api/ipad/config/:deviceId - Error updating iPad config', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to update iPad configuration' });
  }
});

// POST /api/ipad/location - Update iPad location
router.post('/location', validateLocation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId, latitude, longitude, accuracy, timestamp } = req.body;

    if (!ipadConfigs[deviceId]) {
      return res.status(404).json({ error: 'iPad not found' });
    }

    // Update location
    ipadConfigs[deviceId].lastLocation = { lat: latitude, lng: longitude };

    // Store location history
    if (!locationHistory[deviceId]) {
      locationHistory[deviceId] = [];
    }

    locationHistory[deviceId].push({
      lat: latitude,
      lng: longitude,
      accuracy: accuracy || 0,
      timestamp: timestamp || new Date().toISOString()
    });

    // Keep only last 100 locations
    if (locationHistory[deviceId].length > 100) {
      locationHistory[deviceId] = locationHistory[deviceId].slice(-100);
    }

    // Calculate walking speed based on recent locations
    if (locationHistory[deviceId].length >= 2) {
      const recent = locationHistory[deviceId].slice(-2);
      const timeDiff = new Date(recent[1].timestamp) - new Date(recent[0].timestamp);
      const distance = calculateDistance(recent[0], recent[1]);
      const speed = distance / (timeDiff / 1000); // meters per second
      
      ipadConfigs[deviceId].walkingSpeed = speed;
      ipadConfigs[deviceId].isWalking = speed > 0.5; // Threshold for walking detection
    }

    logger.info('POST /api/ipad/location - Updated iPad location', { 
      deviceId, 
      latitude, 
      longitude 
    });

    res.json({
      deviceId,
      location: { lat: latitude, lng: longitude },
      walkingSpeed: ipadConfigs[deviceId].walkingSpeed,
      isWalking: ipadConfigs[deviceId].isWalking,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('POST /api/ipad/location - Error updating iPad location', { error: error.message });
    res.status(500).json({ error: 'Failed to update iPad location' });
  }
});

// GET /api/ipad/:deviceId/location - Get iPad location
router.get('/:deviceId/location', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const config = ipadConfigs[deviceId];

    if (!config) {
      return res.status(404).json({ error: 'iPad not found' });
    }

    const locationData = {
      deviceId,
      currentLocation: config.lastLocation,
      walkingSpeed: config.walkingSpeed,
      isWalking: config.isWalking,
      lastUpdated: new Date(),
      history: locationHistory[deviceId] || []
    };

    res.json(locationData);
  } catch (error) {
    logger.error('GET /api/ipad/:deviceId/location - Error getting iPad location', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to get iPad location' });
  }
});

// POST /api/ipad/:deviceId/battery - Update battery status
router.post('/:deviceId/battery', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { level, isCharging } = req.body;

    if (!ipadConfigs[deviceId]) {
      return res.status(404).json({ error: 'iPad not found' });
    }

    // Update battery status
    ipadConfigs[deviceId].batteryLevel = level;
    ipadConfigs[deviceId].isCharging = isCharging;

    logger.info('POST /api/ipad/:deviceId/battery - Updated battery status', { 
      deviceId, 
      level, 
      isCharging 
    });

    res.json({
      deviceId,
      batteryLevel: level,
      isCharging,
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('POST /api/ipad/:deviceId/battery - Error updating battery status', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to update battery status' });
  }
});

// GET /api/ipad/:deviceId/status - Get iPad status
router.get('/:deviceId/status', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const config = ipadConfigs[deviceId];

    if (!config) {
      return res.status(404).json({ error: 'iPad not found' });
    }

    const status = {
      deviceId,
      orientation: config.orientation,
      brightness: config.brightness,
      autoLock: config.autoLock,
      batteryOptimization: config.batteryOptimization,
      touchSensitivity: config.touchSensitivity,
      hapticFeedback: config.hapticFeedback,
      location: config.location,
      currentLocation: config.lastLocation,
      batteryLevel: config.batteryLevel,
      isCharging: config.isCharging,
      walkingSpeed: config.walkingSpeed,
      isWalking: config.isWalking,
      uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
      lastSeen: new Date(),
      health: config.batteryLevel > 20 ? 'good' : 'warning'
    };

    res.json(status);
  } catch (error) {
    logger.error('GET /api/ipad/:deviceId/status - Error getting iPad status', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to get iPad status' });
  }
});

// POST /api/ipad/:deviceId/orientation - Change orientation
router.post('/:deviceId/orientation', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { orientation } = req.body;

    if (!ipadConfigs[deviceId]) {
      return res.status(404).json({ error: 'iPad not found' });
    }

    if (!['portrait', 'landscape'].includes(orientation)) {
      return res.status(400).json({ error: 'Invalid orientation. Use: portrait or landscape' });
    }

    // Update orientation
    ipadConfigs[deviceId].orientation = orientation;

    logger.info('POST /api/ipad/:deviceId/orientation - Changed orientation', { 
      deviceId, 
      orientation 
    });

    res.json({
      deviceId,
      orientation,
      timestamp: new Date(),
      message: `Orientation changed to ${orientation}`
    });
  } catch (error) {
    logger.error('POST /api/ipad/:deviceId/orientation - Error changing orientation', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to change orientation' });
  }
});

// POST /api/ipad/:deviceId/brightness - Adjust brightness
router.post('/:deviceId/brightness', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { brightness } = req.body;

    if (!ipadConfigs[deviceId]) {
      return res.status(404).json({ error: 'iPad not found' });
    }

    if (brightness < 0 || brightness > 100) {
      return res.status(400).json({ error: 'Brightness must be between 0 and 100' });
    }

    // Update brightness
    ipadConfigs[deviceId].brightness = brightness;

    logger.info('POST /api/ipad/:deviceId/brightness - Adjusted brightness', { 
      deviceId, 
      brightness 
    });

    res.json({
      deviceId,
      brightness,
      timestamp: new Date(),
      message: `Brightness adjusted to ${brightness}%`
    });
  } catch (error) {
    logger.error('POST /api/ipad/:deviceId/brightness - Error adjusting brightness', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to adjust brightness' });
  }
});

// GET /api/ipad/overview - Get all iPads overview
router.get('/overview', async (req, res) => {
  try {
    const overview = {
      total: Object.keys(ipadConfigs).length,
      byOrientation: {
        portrait: Object.values(ipadConfigs).filter(c => c.orientation === 'portrait').length,
        landscape: Object.values(ipadConfigs).filter(c => c.orientation === 'landscape').length
      },
      byStatus: {
        walking: Object.values(ipadConfigs).filter(c => c.isWalking).length,
        stationary: Object.values(ipadConfigs).filter(c => !c.isWalking).length
      },
      averageBatteryLevel: Object.values(ipadConfigs).reduce((sum, c) => sum + c.batteryLevel, 0) / Object.keys(ipadConfigs).length,
      averageWalkingSpeed: Object.values(ipadConfigs).reduce((sum, c) => sum + c.walkingSpeed, 0) / Object.keys(ipadConfigs).length,
      lastUpdated: new Date()
    };

    logger.info('GET /api/ipad/overview - Retrieved iPads overview');
    res.json(overview);
  } catch (error) {
    logger.error('GET /api/ipad/overview - Error retrieving iPads overview', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve iPads overview' });
  }
});

// Helper function to calculate distance between two coordinates
function calculateDistance(point1, point2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = router;
