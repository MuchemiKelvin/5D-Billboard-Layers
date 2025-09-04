const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FirebaseService = require('../services/FirebaseService');
const { logger } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');

// Get all slots
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 24, category, isActive, blockId } = req.query;
    
    const filter = {};
    if (category) filter.where = [{ field: 'category', operator: '==', value: category }];
    if (isActive !== undefined) filter.where = [...(filter.where || []), { field: 'isActive', operator: '==', value: isActive === 'true' }];
    if (blockId) filter.where = [...(filter.where || []), { field: 'blockId', operator: '==', value: blockId }];
    
    filter.orderBy = { field: 'slotNumber', direction: 'asc' };
    filter.limit = parseInt(limit);
    
    const slots = await FirebaseService.getAll('slots', filter);
    
    res.json({
      success: true,
      data: slots,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: slots.length,
        pages: Math.ceil(slots.length / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('❌ Failed to get slots: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get slots',
      error: error.message
    });
  }
});

// Get slot by ID
router.get('/:id', async (req, res) => {
  try {
    const slot = await FirebaseService.getById('slots', req.params.id);
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    res.json({
      success: true,
      data: slot
    });
  } catch (error) {
    logger.error('❌ Failed to get slot: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get slot',
      error: error.message
    });
  }
});

// Get slot by number
router.get('/number/:slotNumber', async (req, res) => {
  try {
    const slots = await FirebaseService.getAll('slots', {
      where: [{ field: 'slotNumber', operator: '==', value: parseInt(req.params.slotNumber) }]
    });
    
    if (slots.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    res.json({
      success: true,
      data: slots[0]
    });
  } catch (error) {
    logger.error('❌ Failed to get slot by number: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get slot',
      error: error.message
    });
  }
});

// Create new slot
router.post('/', authenticateToken, [
  body('slotNumber').isInt({ min: 1, max: 24 }).withMessage('Slot number must be between 1 and 24'),
  body('category').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('isActive').optional().isBoolean(),
  body('blockId').optional().isString().trim().isLength({ min: 1 })
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

    const slotData = {
      slotNumber: req.body.slotNumber,
      category: req.body.category || 'general',
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      blockId: req.body.blockId || null,
      sponsor: null,
      viewCount: 0,
      scanCount: 0,
      arActivationCount: 0,
      layers: {
        layer1: { isActive: true, content: null },
        layer2: { isActive: false, content: null },
        layer3: { isActive: false, content: null }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newSlot = await FirebaseService.create('slots', slotData);
    
    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data: newSlot
    });
  } catch (error) {
    logger.error('❌ Failed to create slot: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create slot',
      error: error.message
    });
  }
});

// Update slot
router.put('/:id', authenticateToken, [
  body('slotNumber').optional().isInt({ min: 1, max: 24 }),
  body('category').optional().isString().trim().isLength({ min: 1, max: 50 }),
  body('isActive').optional().isBoolean(),
  body('blockId').optional().isString().trim().isLength({ min: 1 })
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

    const updateData = { ...req.body, updatedAt: new Date() };
    const updatedSlot = await FirebaseService.update('slots', req.params.id, updateData);
    
    res.json({
      success: true,
      message: 'Slot updated successfully',
      data: updatedSlot
    });
  } catch (error) {
    logger.error('❌ Failed to update slot: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update slot',
      error: error.message
    });
  }
});

// Delete slot
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await FirebaseService.delete('slots', req.params.id);
    
    res.json({
      success: true,
      message: 'Slot deleted successfully'
    });
  } catch (error) {
    logger.error('❌ Failed to delete slot: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete slot',
      error: error.message
    });
  }
});

// Get active slots
router.get('/active/current', async (req, res) => {
  try {
    const activeSlots = await FirebaseService.getActiveSlots();
    
    res.json({
      success: true,
      data: activeSlots
    });
  } catch (error) {
    logger.error('❌ Failed to get active slots: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get active slots',
      error: error.message
    });
  }
});

// Get slots by block
router.get('/block/:blockId', async (req, res) => {
  try {
    const slots = await FirebaseService.getSlotsByBlock(req.params.blockId);
    
    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    logger.error('❌ Failed to get slots by block: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get slots by block',
      error: error.message
    });
  }
});

// Update slot layers
router.patch('/:id/layers', authenticateToken, [
  body('layers').isObject().withMessage('Layers must be an object')
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

    const updateData = {
      layers: req.body.layers,
      updatedAt: new Date()
    };
    
    const updatedSlot = await FirebaseService.update('slots', req.params.id, updateData);
    
    res.json({
      success: true,
      message: 'Slot layers updated successfully',
      data: updatedSlot
    });
  } catch (error) {
    logger.error('❌ Failed to update slot layers: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update slot layers',
      error: error.message
    });
  }
});

// Get slot performance
router.get('/:id/performance', async (req, res) => {
  try {
    const slot = await FirebaseService.getById('slots', req.params.id);
    
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }
    
    const performance = {
      slotNumber: slot.slotNumber,
      viewCount: slot.viewCount || 0,
      scanCount: slot.scanCount || 0,
      arActivationCount: slot.arActivationCount || 0,
      totalInteractions: (slot.viewCount || 0) + (slot.scanCount || 0) + (slot.arActivationCount || 0),
      lastUpdated: slot.updatedAt
    };
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('❌ Failed to get slot performance: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get slot performance',
      error: error.message
    });
  }
});

module.exports = router;
