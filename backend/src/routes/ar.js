const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');

// Mock AR content data (replace with actual database operations)
let arContent = [
  {
    id: '1',
    name: 'Product Showcase AR',
    description: 'Interactive 3D product showcase with animations',
    modelType: 'gltf',
    modelUrl: '/uploads/ar-models/product-showcase.gltf',
    thumbnailUrl: '/uploads/ar-thumbnails/product-showcase.jpg',
    triggerType: 'qr',
    triggerId: 'qr-001',
    slotId: '15',
    isActive: true,
    activationCount: 0,
    lastActivated: null,
    settings: {
      scale: 1.0,
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      animations: ['idle', 'interact'],
      interactions: ['tap', 'swipe', 'rotate']
    },
    metadata: {
      category: 'product',
      tags: ['interactive', '3d', 'showcase'],
      targetAudience: 'general',
      estimatedLoadTime: 3.2
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Brand Experience AR',
    description: 'Immersive brand storytelling experience',
    modelType: 'glb',
    modelUrl: '/uploads/ar-models/brand-experience.glb',
    thumbnailUrl: '/uploads/ar-thumbnails/brand-experience.jpg',
    triggerType: 'nfc',
    triggerId: 'nfc-001',
    slotId: '8',
    isActive: true,
    activationCount: 0,
    lastActivated: null,
    settings: {
      scale: 1.2,
      rotation: { x: 0, y: 0, z: 0 },
      position: { x: 0, y: 0, z: 0 },
      animations: ['intro', 'loop', 'outro'],
      interactions: ['gaze', 'gesture', 'voice']
    },
    metadata: {
      category: 'brand',
      tags: ['immersive', 'storytelling', 'experience'],
      targetAudience: 'premium',
      estimatedLoadTime: 4.8
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Validation middleware
const validateARContent = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('description').trim().isLength({ min: 1, max: 500 }).withMessage('Description is required and must be less than 500 characters'),
  body('modelType').isIn(['gltf', 'glb', 'fbx']).withMessage('Model type must be gltf, glb, or fbx'),
  body('triggerType').isIn(['qr', 'nfc', 'manual']).withMessage('Trigger type must be qr, nfc, or manual'),
  body('slotId').isString().withMessage('Slot ID is required'),
  body('isActive').isBoolean().withMessage('Is active must be a boolean')
];

// Get all AR content
router.get('/', async (req, res) => {
  try {
    logger.info('GET /api/ar - Retrieving all AR content');
    
    const { slotId, triggerType, category, active } = req.query;
    let filteredContent = [...arContent];
    
    if (slotId) {
      filteredContent = filteredContent.filter(content => content.slotId === slotId);
    }
    
    if (triggerType) {
      filteredContent = filteredContent.filter(content => content.triggerType === triggerType);
    }
    
    if (category) {
      filteredContent = filteredContent.filter(content => content.metadata.category === category);
    }
    
    if (active !== undefined) {
      const isActive = active === 'true';
      filteredContent = filteredContent.filter(content => content.isActive === isActive);
    }
    
    res.json({
      success: true,
      data: filteredContent,
      count: filteredContent.length,
      total: arContent.length
    });
  } catch (error) {
    logger.error('Error retrieving AR content:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get AR content by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/ar/${id} - Retrieving AR content`);
    
    const content = arContent.find(c => c.id === id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'AR content not found',
        message: `AR content with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    logger.error(`Error retrieving AR content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create AR content
router.post('/', authenticateToken, requireRole(['admin', 'operator']), validateARContent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }
    
    const { name, description, modelType, modelUrl, thumbnailUrl, triggerType, triggerId, slotId, isActive, settings, metadata } = req.body;
    logger.info(`POST /api/ar - Creating AR content: ${name}`);
    
    // Check if slot is already occupied by another AR content
    const slotOccupied = arContent.some(content => 
      content.slotId === slotId && content.isActive
    );
    
    if (slotOccupied) {
      return res.status(400).json({
        success: false,
        error: 'Slot occupied',
        message: `Slot ${slotId} is already occupied by active AR content`
      });
    }
    
    const newContent = {
      id: Date.now().toString(),
      name,
      description,
      modelType,
      modelUrl: modelUrl || '',
      thumbnailUrl: thumbnailUrl || '',
      triggerType,
      triggerId: triggerId || `${triggerType}-${Date.now()}`,
      slotId,
      isActive: isActive !== undefined ? isActive : true,
      activationCount: 0,
      lastActivated: null,
      settings: settings || {
        scale: 1.0,
        rotation: { x: 0, y: 0, z: 0 },
        position: { x: 0, y: 0, z: 0 },
        animations: [],
        interactions: []
      },
      metadata: metadata || {
        category: 'general',
        tags: [],
        targetAudience: 'general',
        estimatedLoadTime: 3.0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    arContent.push(newContent);
    
    logger.info(`AR content created successfully: ${newContent.id}`);
    res.status(201).json({
      success: true,
      data: newContent,
      message: 'AR content created successfully'
    });
  } catch (error) {
    logger.error('Error creating AR content:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update AR content
router.put('/:id', authenticateToken, requireRole(['admin', 'operator']), validateARContent, async (req, res) => {
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
    
    logger.info(`PUT /api/ar/${id} - Updating AR content`);
    
    const contentIndex = arContent.findIndex(c => c.id === id);
    
    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'AR content not found',
        message: `AR content with ID ${id} does not exist`
      });
    }
    
    const { name, description, modelType, modelUrl, thumbnailUrl, triggerType, triggerId, slotId, isActive, settings, metadata } = req.body;
    
    // Check slot occupancy if slotId is being changed
    if (slotId && slotId !== arContent[contentIndex].slotId) {
      const slotOccupied = arContent.some((content, index) => 
        index !== contentIndex && content.slotId === slotId && content.isActive
      );
      
      if (slotOccupied) {
        return res.status(400).json({
          success: false,
          error: 'Slot occupied',
          message: `Slot ${slotId} is already occupied by active AR content`
        });
      }
    }
    
    const updatedContent = {
      ...arContent[contentIndex],
      name: name || arContent[contentIndex].name,
      description: description || arContent[contentIndex].description,
      modelType: modelType || arContent[contentIndex].modelType,
      modelUrl: modelUrl || arContent[contentIndex].modelUrl,
      thumbnailUrl: thumbnailUrl || arContent[contentIndex].thumbnailUrl,
      triggerType: triggerType || arContent[contentIndex].triggerType,
      triggerId: triggerId || arContent[contentIndex].triggerId,
      slotId: slotId || arContent[contentIndex].slotId,
      isActive: isActive !== undefined ? isActive : arContent[contentIndex].isActive,
      settings: settings || arContent[contentIndex].settings,
      metadata: metadata || arContent[contentIndex].metadata,
      updatedAt: new Date()
    };
    
    arContent[contentIndex] = updatedContent;
    
    logger.info(`AR content updated successfully: ${id}`);
    res.json({
      success: true,
      data: updatedContent,
      message: 'AR content updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating AR content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Delete AR content
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /api/ar/${id} - Deleting AR content`);
    
    const contentIndex = arContent.findIndex(c => c.id === id);
    
    if (contentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'AR content not found',
        message: `AR content with ID ${id} does not exist`
      });
    }
    
    const content = arContent[contentIndex];
    
    if (content.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete active content',
        message: 'Active AR content cannot be deleted'
      });
    }
    
    arContent.splice(contentIndex, 1);
    
    logger.info(`AR content deleted successfully: ${id}`);
    res.json({
      success: true,
      message: 'AR content deleted successfully',
      deletedContent: content
    });
  } catch (error) {
    logger.error(`Error deleting AR content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Activate AR content
router.post('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceId, deviceType, location } = req.body;
    logger.info(`POST /api/ar/${id}/activate - Activating AR content`);
    
    const content = arContent.find(c => c.id === id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'AR content not found',
        message: `AR content with ID ${id} does not exist`
      });
    }
    
    if (!content.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Content not active',
        message: 'AR content is not currently active'
      });
    }
    
    // Update activation count and timestamp
    content.activationCount += 1;
    content.lastActivated = new Date();
    
    // Log activation for analytics
    logger.info(`AR content activated: ${id} by device: ${deviceId || 'unknown'}`);
    
    res.json({
      success: true,
      data: {
        contentId: content.id,
        contentName: content.name,
        modelUrl: content.modelUrl,
        settings: content.settings,
        activationCount: content.activationCount,
        message: 'AR content activated successfully'
      }
    });
  } catch (error) {
    logger.error(`Error activating AR content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get AR content analytics
router.get('/:id/analytics', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/ar/${id}/analytics - Retrieving AR content analytics`);
    
    const content = arContent.find(c => c.id === id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'AR content not found',
        message: `AR content with ID ${id} does not exist`
      });
    }
    
    // Mock analytics data (replace with actual analytics)
    const analytics = {
      contentId: content.id,
      contentName: content.name,
      totalActivations: content.activationCount,
      lastActivated: content.lastActivated,
      averageLoadTime: content.metadata.estimatedLoadTime,
      engagementMetrics: {
        averageSessionDuration: Math.random() * 120 + 30, // 30-150 seconds
        completionRate: Math.random() * 100, // 0-100%
        interactionRate: Math.random() * 100, // 0-100%
        returnRate: Math.random() * 50 // 0-50%
      },
      deviceMetrics: {
        mobile: Math.floor(Math.random() * 70) + 20, // 20-90%
        tablet: Math.floor(Math.random() * 30) + 5, // 5-35%
        desktop: Math.floor(Math.random() * 20) + 5 // 5-25%
      },
      performanceMetrics: {
        loadTime: {
          average: content.metadata.estimatedLoadTime,
          min: content.metadata.estimatedLoadTime * 0.7,
          max: content.metadata.estimatedLoadTime * 1.5
        },
        errorRate: Math.random() * 10, // 0-10%
        successRate: 100 - Math.random() * 10 // 90-100%
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error(`Error retrieving analytics for AR content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Upload AR model files
router.post('/:id/upload', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`POST /api/ar/${id}/upload - Uploading AR model files`);
    
    const content = arContent.find(c => c.id === id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'AR content not found',
        message: `AR content with ID ${id} does not exist`
      });
    }
    
    // Mock file upload (replace with actual file upload logic)
    const { modelFile, thumbnailFile } = req.body;
    
    if (!modelFile) {
      return res.status(400).json({
        success: false,
        error: 'Model file required',
        message: 'AR model file is required'
      });
    }
    
    // Update content with new file URLs
    content.modelUrl = `/uploads/ar-models/${modelFile}`;
    if (thumbnailFile) {
      content.thumbnailUrl = `/uploads/ar-thumbnails/${thumbnailFile}`;
    }
    content.updatedAt = new Date();
    
    logger.info(`AR model files uploaded successfully for content: ${id}`);
    res.json({
      success: true,
      data: {
        contentId: content.id,
        modelUrl: content.modelUrl,
        thumbnailUrl: content.thumbnailUrl,
        message: 'AR model files uploaded successfully'
      }
    });
  } catch (error) {
    logger.error(`Error uploading AR model files for content ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get AR triggers
router.get('/triggers', async (req, res) => {
  try {
    logger.info('GET /api/ar/triggers - Retrieving AR triggers');
    
    const triggers = arContent
      .filter(content => content.isActive)
      .map(content => ({
        id: content.triggerId,
        type: content.triggerType,
        contentId: content.id,
        contentName: content.name,
        slotId: content.slotId,
        isActive: content.isActive
      }));
    
    res.json({
      success: true,
      data: triggers,
      count: triggers.length
    });
  } catch (error) {
    logger.error('Error retrieving AR triggers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Create AR trigger
router.post('/triggers', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { triggerId, triggerType, contentId } = req.body;
    logger.info(`POST /api/ar/triggers - Creating AR trigger: ${triggerId}`);
    
    if (!triggerId || !triggerType || !contentId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Trigger ID, type, and content ID are required'
      });
    }
    
    // Check if trigger already exists
    const existingTrigger = arContent.find(content => content.triggerId === triggerId);
    if (existingTrigger) {
      return res.status(400).json({
        success: false,
        error: 'Trigger already exists',
        message: `Trigger ID ${triggerId} is already in use`
      });
    }
    
    // Check if content exists
    const content = arContent.find(c => c.id === contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
        message: `AR content with ID ${contentId} does not exist`
      });
    }
    
    // Update content with new trigger
    content.triggerId = triggerId;
    content.triggerType = triggerType;
    content.updatedAt = new Date();
    
    logger.info(`AR trigger created successfully: ${triggerId}`);
    res.status(201).json({
      success: true,
      data: {
        triggerId,
        triggerType,
        contentId,
        message: 'AR trigger created successfully'
      }
    });
  } catch (error) {
    logger.error('Error creating AR trigger:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get available AR models
router.get('/models', async (req, res) => {
  try {
    logger.info('GET /api/ar/models - Retrieving available AR models');
    
    const models = arContent
      .filter(content => content.isActive)
      .map(content => ({
        id: content.id,
        name: content.name,
        modelType: content.modelType,
        modelUrl: content.modelUrl,
        thumbnailUrl: content.thumbnailUrl,
        slotId: content.slotId,
        triggerType: content.triggerType,
        triggerId: content.triggerId
      }));
    
    res.json({
      success: true,
      data: models,
      count: models.length
    });
  } catch (error) {
    logger.error('Error retrieving AR models:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Process AR scan/trigger
router.post('/scan', async (req, res) => {
  try {
    const { triggerId, triggerType, deviceId, deviceType, location } = req.body;
    logger.info(`POST /api/ar/scan - Processing AR scan/trigger: ${triggerId}`);
    
    if (!triggerId || !triggerType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Trigger ID and type are required'
      });
    }
    
    // Find content by trigger
    const content = arContent.find(c => 
      c.triggerId === triggerId && 
      c.triggerType === triggerType && 
      c.isActive
    );
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'AR content not found',
        message: `No active AR content found for trigger: ${triggerId}`
      });
    }
    
    // Update activation metrics
    content.activationCount += 1;
    content.lastActivated = new Date();
    
    // Log scan for analytics
    logger.info(`AR scan processed: ${triggerId} for content: ${content.id} by device: ${deviceId || 'unknown'}`);
    
    res.json({
      success: true,
      data: {
        contentId: content.id,
        contentName: content.name,
        modelUrl: content.modelUrl,
        settings: content.settings,
        message: 'AR scan processed successfully'
      }
    });
  } catch (error) {
    logger.error('Error processing AR scan:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get AR performance metrics
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    logger.info('GET /api/ar/performance - Retrieving AR performance metrics');
    
    const { period = '24h' } = req.query;
    
    // Mock performance data (replace with actual analytics)
    const performance = {
      period,
      totalActivations: arContent.reduce((sum, content) => sum + content.activationCount, 0),
      activeContent: arContent.filter(content => content.isActive).length,
      averageLoadTime: arContent.reduce((sum, content) => sum + content.metadata.estimatedLoadTime, 0) / arContent.length,
      topPerforming: arContent
        .sort((a, b) => b.activationCount - a.activationCount)
        .slice(0, 5)
        .map(content => ({
          id: content.id,
          name: content.name,
          activations: content.activationCount,
          slotId: content.slotId
        })),
      triggerBreakdown: {
        qr: arContent.filter(c => c.triggerType === 'qr').length,
        nfc: arContent.filter(c => c.triggerType === 'nfc').length,
        manual: arContent.filter(c => c.triggerType === 'manual').length
      },
      categoryBreakdown: arContent.reduce((acc, content) => {
        const category = content.metadata.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('Error retrieving AR performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
