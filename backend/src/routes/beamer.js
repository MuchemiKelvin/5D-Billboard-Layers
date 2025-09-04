const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Mock beamer configurations
let beamerConfigs = {
  'beamer-001': {
    projectionMode: 'front',
    brightness: 100,
    contrast: 50,
    keystone: { horizontal: 0, vertical: 0 },
    aspectRatio: '16:9',
    refreshRate: 60,
    lampHours: 1200,
    temperature: 45,
    status: 'active'
  }
};

// Validation rules
const validateBeamerConfig = [
  body('projectionMode').isIn(['front', 'rear', 'ceiling']),
  body('brightness').isInt({ min: 0, max: 100 }),
  body('contrast').isInt({ min: 0, max: 100 }),
  body('keystone.horizontal').isInt({ min: -50, max: 50 }),
  body('keystone.vertical').isInt({ min: -50, max: 50 }),
  body('aspectRatio').isIn(['16:9', '4:3', '21:9']),
  body('refreshRate').isIn([60, 120, 144])
];

// GET /api/beamer/config/:deviceId - Get beamer configuration
router.get('/config/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const config = beamerConfigs[deviceId];

    if (!config) {
      return res.status(404).json({ error: 'Beamer configuration not found' });
    }

    logger.info('GET /api/beamer/config/:deviceId - Retrieved beamer config', { deviceId });
    res.json(config);
  } catch (error) {
    logger.error('GET /api/beamer/config/:deviceId - Error retrieving beamer config', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to retrieve beamer configuration' });
  }
});

// PUT /api/beamer/config/:deviceId - Update beamer configuration
router.put('/config/:deviceId', authenticateToken, requireRole(['admin', 'operator']), validateBeamerConfig, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deviceId } = req.params;
    const updates = req.body;

    if (!beamerConfigs[deviceId]) {
      beamerConfigs[deviceId] = {
        projectionMode: 'front',
        brightness: 100,
        contrast: 50,
        keystone: { horizontal: 0, vertical: 0 },
        aspectRatio: '16:9',
        refreshRate: 60,
        lampHours: 0,
        temperature: 25,
        status: 'active'
      };
    }

    // Update configuration
    beamerConfigs[deviceId] = {
      ...beamerConfigs[deviceId],
      ...updates
    };

    logger.info('PUT /api/beamer/config/:deviceId - Updated beamer config', { deviceId, updates });
    res.json(beamerConfigs[deviceId]);
  } catch (error) {
    logger.error('PUT /api/beamer/config/:deviceId - Error updating beamer config', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to update beamer configuration' });
  }
});

// POST /api/beamer/:deviceId/calibrate - Start beamer calibration
router.post('/:deviceId/calibrate', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { mode } = req.body; // 'auto' or 'manual'

    if (!beamerConfigs[deviceId]) {
      return res.status(404).json({ error: 'Beamer not found' });
    }

    // Simulate calibration process
    const calibrationResult = {
      deviceId,
      mode: mode || 'auto',
      status: 'calibrating',
      startTime: new Date(),
      estimatedDuration: mode === 'auto' ? 30000 : 60000, // 30s or 60s
      steps: mode === 'auto' ? [
        'Detecting projection surface',
        'Measuring distance',
        'Adjusting focus',
        'Correcting keystone',
        'Optimizing brightness',
        'Final adjustments'
      ] : [
        'Manual calibration mode',
        'Waiting for operator input'
      ]
    };

    logger.info('POST /api/beamer/:deviceId/calibrate - Started beamer calibration', { 
      deviceId, 
      mode 
    });

    // In a real implementation, this would trigger the actual calibration
    setTimeout(() => {
      beamerConfigs[deviceId].status = 'calibrated';
      logger.info('Beamer calibration completed', { deviceId });
    }, calibrationResult.estimatedDuration);

    res.json(calibrationResult);
  } catch (error) {
    logger.error('POST /api/beamer/:deviceId/calibrate - Error starting calibration', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to start calibration' });
  }
});

// GET /api/beamer/:deviceId/calibration/status - Get calibration status
router.get('/:deviceId/calibration/status', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const config = beamerConfigs[deviceId];

    if (!config) {
      return res.status(404).json({ error: 'Beamer not found' });
    }

    const status = {
      deviceId,
      status: config.status,
      lastCalibration: new Date(Date.now() - 3600000), // 1 hour ago
      nextCalibration: new Date(Date.now() + 86400000), // 24 hours from now
      lampHours: config.lampHours,
      temperature: config.temperature,
      health: config.lampHours < 2000 ? 'good' : 'warning'
    };

    res.json(status);
  } catch (error) {
    logger.error('GET /api/beamer/:deviceId/calibration/status - Error getting calibration status', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to get calibration status' });
  }
});

// POST /api/beamer/:deviceId/test-pattern - Display test pattern
router.post('/:deviceId/test-pattern', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { pattern, duration } = req.body;

    if (!beamerConfigs[deviceId]) {
      return res.status(404).json({ error: 'Beamer not found' });
    }

    const testPatterns = {
      'grid': 'Calibration grid pattern',
      'color': 'Color test pattern',
      'focus': 'Focus test pattern',
      'geometry': 'Geometry test pattern'
    };

    const result = {
      deviceId,
      pattern: pattern || 'grid',
      description: testPatterns[pattern] || testPatterns['grid'],
      duration: duration || 10000, // 10 seconds default
      startTime: new Date(),
      status: 'active'
    };

    logger.info('POST /api/beamer/:deviceId/test-pattern - Started test pattern', { 
      deviceId, 
      pattern: result.pattern 
    });

    // Simulate test pattern display
    setTimeout(() => {
      result.status = 'completed';
      logger.info('Test pattern completed', { deviceId, pattern: result.pattern });
    }, result.duration);

    res.json(result);
  } catch (error) {
    logger.error('POST /api/beamer/:deviceId/test-pattern - Error starting test pattern', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to start test pattern' });
  }
});

// GET /api/beamer/:deviceId/status - Get beamer status
router.get('/:deviceId/status', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const config = beamerConfigs[deviceId];

    if (!config) {
      return res.status(404).json({ error: 'Beamer not found' });
    }

    const status = {
      deviceId,
      status: config.status,
      projectionMode: config.projectionMode,
      brightness: config.brightness,
      contrast: config.contrast,
      aspectRatio: config.aspectRatio,
      refreshRate: config.refreshRate,
      lampHours: config.lampHours,
      temperature: config.temperature,
      uptime: Math.floor(Math.random() * 86400), // Random uptime in seconds
      lastMaintenance: new Date(Date.now() - 604800000), // 1 week ago
      nextMaintenance: new Date(Date.now() + 2592000000) // 30 days from now
    };

    res.json(status);
  } catch (error) {
    logger.error('GET /api/beamer/:deviceId/status - Error getting beamer status', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to get beamer status' });
  }
});

// POST /api/beamer/:deviceId/power - Control beamer power
router.post('/:deviceId/power', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { action } = req.body; // 'on', 'off', 'standby'

    if (!beamerConfigs[deviceId]) {
      return res.status(404).json({ error: 'Beamer not found' });
    }

    const validActions = ['on', 'off', 'standby'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use: on, off, standby' });
    }

    const result = {
      deviceId,
      action,
      timestamp: new Date(),
      status: 'success',
      message: `Beamer ${action} command executed successfully`
    };

    // Update beamer status based on action
    if (action === 'off') {
      beamerConfigs[deviceId].status = 'offline';
    } else if (action === 'standby') {
      beamerConfigs[deviceId].status = 'standby';
    } else if (action === 'on') {
      beamerConfigs[deviceId].status = 'active';
    }

    logger.info('POST /api/beamer/:deviceId/power - Power control executed', { 
      deviceId, 
      action 
    });

    res.json(result);
  } catch (error) {
    logger.error('POST /api/beamer/:deviceId/power - Error controlling beamer power', { 
      deviceId: req.params.deviceId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to control beamer power' });
  }
});

// GET /api/beamer/overview - Get all beamers overview
router.get('/overview', async (req, res) => {
  try {
    const overview = {
      total: Object.keys(beamerConfigs).length,
      byStatus: {
        active: Object.values(beamerConfigs).filter(c => c.status === 'active').length,
        standby: Object.values(beamerConfigs).filter(c => c.status === 'standby').length,
        offline: Object.values(beamerConfigs).filter(c => c.status === 'offline').length,
        calibrating: Object.values(beamerConfigs).filter(c => c.status === 'calibrating').length
      },
      averageLampHours: Object.values(beamerConfigs).reduce((sum, c) => sum + c.lampHours, 0) / Object.keys(beamerConfigs).length,
      averageTemperature: Object.values(beamerConfigs).reduce((sum, c) => sum + c.temperature, 0) / Object.keys(beamerConfigs).length,
      lastUpdated: new Date()
    };

    logger.info('GET /api/beamer/overview - Retrieved beamers overview');
    res.json(overview);
  } catch (error) {
    logger.error('GET /api/beamer/overview - Error retrieving beamers overview', { error: error.message });
    res.status(500).json({ error: 'Failed to retrieve beamers overview' });
  }
});

module.exports = router;
