const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');

// Mock data for demonstration (replace with actual database operations)
let blocks = [
  {
    id: '1',
    name: 'Morning Block',
    startTime: '06:00',
    endTime: '10:00',
    duration: 4,
    isActive: true,
    currentSlotIndex: 0,
    totalSlots: 6,
    status: 'active',
    autoRotate: true,
    rotationInterval: 30,
    slots: ['1', '2', '3', '4', '5', '6'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Midday Block',
    startTime: '10:00',
    endTime: '14:00',
    duration: 4,
    isActive: false,
    currentSlotIndex: 0,
    totalSlots: 6,
    status: 'scheduled',
    autoRotate: true,
    rotationInterval: 30,
    slots: ['7', '8', '9', '10', '11', '12'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Afternoon Block',
    startTime: '14:00',
    endTime: '18:00',
    duration: 4,
    isActive: false,
    currentSlotIndex: 0,
    totalSlots: 6,
    status: 'scheduled',
    autoRotate: true,
    rotationInterval: 30,
    slots: ['13', '14', '15', '16', '17', '18'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Evening Block',
    startTime: '18:00',
    endTime: '22:00',
    duration: 4,
    isActive: false,
    currentSlotIndex: 0,
    totalSlots: 6,
    status: 'scheduled',
    autoRotate: true,
    rotationInterval: 30,
    slots: ['19', '20', '21', '22', '23', '24'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Validation middleware
const validateBlock = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('duration').isInt({ min: 1, max: 24 }).withMessage('Duration must be between 1 and 24 hours'),
  body('autoRotate').isBoolean().withMessage('Auto rotate must be a boolean'),
  body('rotationInterval').isInt({ min: 15, max: 300 }).withMessage('Rotation interval must be between 15 and 300 seconds')
];

// Get all blocks
router.get('/', async (req, res) => {
  try {
    logger.info('GET /api/blocks - Retrieving all blocks');
    
    const { status, active } = req.query;
    let filteredBlocks = [...blocks];
    
    if (status) {
      filteredBlocks = filteredBlocks.filter(block => block.status === status);
    }
    
    if (active !== undefined) {
      const isActive = active === 'true';
      filteredBlocks = filteredBlocks.filter(block => block.isActive === isActive);
    }
    
    res.json({
      success: true,
      data: filteredBlocks,
      count: filteredBlocks.length,
      total: blocks.length
    });
  } catch (error) {
    logger.error('Error retrieving blocks:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get block by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/blocks/${id} - Retrieving block`);
    
    const block = blocks.find(b => b.id === id);
    
    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
        message: `Block with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: block
    });
  } catch (error) {
    logger.error(`Error retrieving block ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create new block
router.post('/', authenticateToken, requireRole(['admin', 'operator']), validateBlock, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }
    
    const { name, startTime, endTime, duration, autoRotate, rotationInterval, slots } = req.body;
    logger.info(`POST /api/blocks - Creating new block: ${name}`);
    
    // Check for time conflicts
    const hasConflict = blocks.some(block => {
      return (startTime >= block.startTime && startTime < block.endTime) ||
             (endTime > block.startTime && endTime <= block.endTime) ||
             (startTime <= block.startTime && endTime >= block.endTime);
    });
    
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        error: 'Time conflict',
        message: 'Block time conflicts with existing blocks'
      });
    }
    
    const newBlock = {
      id: Date.now().toString(),
      name,
      startTime,
      endTime,
      duration,
      isActive: false,
      currentSlotIndex: 0,
      totalSlots: slots ? slots.length : 6,
      status: 'scheduled',
      autoRotate: autoRotate !== undefined ? autoRotate : true,
      rotationInterval: rotationInterval || 30,
      slots: slots || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    blocks.push(newBlock);
    
    logger.info(`Block created successfully: ${newBlock.id}`);
    res.status(201).json({
      success: true,
      data: newBlock,
      message: 'Block created successfully'
    });
  } catch (error) {
    logger.error('Error creating block:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update block
router.put('/:id', authenticateToken, requireRole(['admin', 'operator']), validateBlock, async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }
    
    logger.info(`PUT /api/blocks/${id} - Updating block`);
    
    const blockIndex = blocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
        message: `Block with ID ${id} does not exist`
      });
    }
    
    const { name, startTime, endTime, duration, autoRotate, rotationInterval, slots } = req.body;
    
    // Check for time conflicts (excluding current block)
    const hasConflict = blocks.some((block, index) => {
      if (index === blockIndex) return false;
      return (startTime >= block.startTime && startTime < block.endTime) ||
             (endTime > block.startTime && endTime <= block.endTime) ||
             (startTime <= block.startTime && endTime >= block.endTime);
    });
    
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        error: 'Time conflict',
        message: 'Block time conflicts with existing blocks'
      });
    }
    
    const updatedBlock = {
      ...blocks[blockIndex],
      name: name || blocks[blockIndex].name,
      startTime: startTime || blocks[blockIndex].startTime,
      endTime: endTime || blocks[blockIndex].endTime,
      duration: duration || blocks[blockIndex].duration,
      autoRotate: autoRotate !== undefined ? autoRotate : blocks[blockIndex].autoRotate,
      rotationInterval: rotationInterval || blocks[blockIndex].rotationInterval,
      slots: slots || blocks[blockIndex].slots,
      totalSlots: slots ? slots.length : blocks[blockIndex].totalSlots,
      updatedAt: new Date()
    };
    
    blocks[blockIndex] = updatedBlock;
    
    logger.info(`Block updated successfully: ${id}`);
    res.json({
      success: true,
      data: updatedBlock,
      message: 'Block updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating block ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete block
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /api/blocks/${id} - Deleting block`);
    
    const blockIndex = blocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
        message: `Block with ID ${id} does not exist`
      });
    }
    
    const block = blocks[blockIndex];
    
    if (block.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete active block',
        message: 'Active blocks cannot be deleted'
      });
    }
    
    blocks.splice(blockIndex, 1);
    
    logger.info(`Block deleted successfully: ${id}`);
    res.json({
      success: true,
      message: 'Block deleted successfully',
      deletedBlock: block
    });
  } catch (error) {
    logger.error(`Error deleting block ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get current active block
router.get('/current', async (req, res) => {
  try {
    logger.info('GET /api/blocks/current - Retrieving current active block');
    
    const currentBlock = blocks.find(block => block.isActive);
    
    if (!currentBlock) {
      return res.status(404).json({
        success: false,
        error: 'No active block',
        message: 'No block is currently active'
      });
    }
    
    res.json({
      success: true,
      data: currentBlock
    });
  } catch (error) {
    logger.error('Error retrieving current block:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get block schedule
router.get('/schedule', async (req, res) => {
  try {
    logger.info('GET /api/blocks/schedule - Retrieving block schedule');
    
    const schedule = blocks.map(block => ({
      id: block.id,
      name: block.name,
      startTime: block.startTime,
      endTime: block.endTime,
      status: block.status,
      isActive: block.isActive,
      totalSlots: block.totalSlots
    }));
    
    res.json({
      success: true,
      data: schedule,
      count: schedule.length
    });
  } catch (error) {
    logger.error('Error retrieving block schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Activate block
router.post('/:id/activate', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`POST /api/blocks/${id}/activate - Activating block`);
    
    const blockIndex = blocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
        message: `Block with ID ${id} does not exist`
      });
    }
    
    const block = blocks[blockIndex];
    
    if (block.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Block already active',
        message: 'Block is already active'
      });
    }
    
    // Deactivate all other blocks
    blocks.forEach((b, index) => {
      if (index !== blockIndex) {
        b.isActive = false;
        b.status = 'scheduled';
      }
    });
    
    // Activate current block
    block.isActive = true;
    block.status = 'active';
    block.currentSlotIndex = 0;
    block.updatedAt = new Date();
    
    logger.info(`Block activated successfully: ${id}`);
    res.json({
      success: true,
      data: block,
      message: 'Block activated successfully'
    });
  } catch (error) {
    logger.error(`Error activating block ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Deactivate block
router.post('/:id/deactivate', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`POST /api/blocks/${id}/deactivate - Deactivating block`);
    
    const blockIndex = blocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
        message: `Block with ID ${id} does not exist`
      });
    }
    
    const block = blocks[blockIndex];
    
    if (!block.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Block not active',
        message: 'Block is not currently active'
      });
    }
    
    block.isActive = false;
    block.status = 'scheduled';
    block.updatedAt = new Date();
    
    logger.info(`Block deactivated successfully: ${id}`);
    res.json({
      success: true,
      data: block,
      message: 'Block deactivated successfully'
    });
  } catch (error) {
    logger.error(`Error deactivating block ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get slots in block
router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/blocks/${id}/slots - Retrieving slots in block`);
    
    const block = blocks.find(b => b.id === id);
    
    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
        message: `Block with ID ${id} does not exist`
      });
    }
    
    // Mock slot data (replace with actual database query)
    const slotData = block.slots.map(slotId => ({
      id: slotId,
      slotNumber: parseInt(slotId),
      status: 'active',
      sponsor: `Sponsor ${slotId}`,
      currentLayer: 'layer-1-static'
    }));
    
    res.json({
      success: true,
      data: {
        block: {
          id: block.id,
          name: block.name,
          startTime: block.startTime,
          endTime: block.endTime,
          status: block.status,
          isActive: block.isActive
        },
        slots: slotData,
        count: slotData.length
      }
    });
  } catch (error) {
    logger.error(`Error retrieving slots for block ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Rotate slots in block
router.post('/:id/rotate', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { direction = 'next' } = req.body;
    logger.info(`POST /api/blocks/${id}/rotate - Rotating slots in block, direction: ${direction}`);
    
    const blockIndex = blocks.findIndex(b => b.id === id);
    
    if (blockIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
        message: `Block with ID ${id} does not exist`
      });
    }
    
    const block = blocks[blockIndex];
    
    if (!block.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Block not active',
        message: 'Cannot rotate slots in inactive block'
      });
    }
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (block.currentSlotIndex + 1) % block.totalSlots;
    } else if (direction === 'previous') {
      newIndex = block.currentSlotIndex === 0 ? block.totalSlots - 1 : block.currentSlotIndex - 1;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid direction',
        message: 'Direction must be "next" or "previous"'
      });
    }
    
    block.currentSlotIndex = newIndex;
    block.updatedAt = new Date();
    
    logger.info(`Slots rotated successfully in block ${id}, new index: ${newIndex}`);
    res.json({
      success: true,
      data: {
        blockId: block.id,
        currentSlotIndex: block.currentSlotIndex,
        currentSlot: block.slots[block.currentSlotIndex],
        direction,
        message: 'Slots rotated successfully'
      }
    });
  } catch (error) {
    logger.error(`Error rotating slots in block ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get block performance metrics
router.get('/:id/performance', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/blocks/${id}/performance - Retrieving block performance metrics`);
    
    const block = blocks.find(b => b.id === id);
    
    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Block not found',
        message: `Block with ID ${id} does not exist`
      });
    }
    
    // Mock performance data (replace with actual analytics)
    const performance = {
      blockId: block.id,
      blockName: block.name,
      totalViews: Math.floor(Math.random() * 1000) + 500,
      totalScans: Math.floor(Math.random() * 100) + 50,
      totalARActivations: Math.floor(Math.random() * 200) + 100,
      averageEngagement: Math.random() * 100,
      slotPerformance: block.slots.map(slotId => ({
        slotId,
        views: Math.floor(Math.random() * 200) + 100,
        scans: Math.floor(Math.random() * 20) + 10,
        arActivations: Math.floor(Math.random() * 50) + 25
      })),
      timeMetrics: {
        startTime: block.startTime,
        endTime: block.endTime,
        duration: block.duration,
        isActive: block.isActive,
        currentSlotIndex: block.currentSlotIndex
      }
    };
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error(`Error retrieving performance for block ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
