const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const FirebaseService = require('../services/FirebaseService');
const { logger } = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth');
const { uploadSponsorAssets } = require('../middleware/upload');

// Get all sponsors
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, tier, isActive, search } = req.query;
    
    const filter = {};
    if (category) filter.where = [{ field: 'category', operator: '==', value: category }];
    if (tier) filter.where = [...(filter.where || []), { field: 'tier', operator: '==', value: tier }];
    if (isActive !== undefined) filter.where = [...(filter.where || []), { field: 'isActive', operator: '==', value: isActive === 'true' }];
    
    filter.orderBy = { field: 'name', direction: 'asc' };
    filter.limit = parseInt(limit);
    
    const sponsors = await FirebaseService.getAll('sponsors', filter);
    
    // Simple search filtering (Firebase doesn't support regex)
    let filteredSponsors = sponsors;
    if (search) {
      filteredSponsors = sponsors.filter(sponsor => 
        sponsor.name?.toLowerCase().includes(search.toLowerCase()) ||
        sponsor.company?.toLowerCase().includes(search.toLowerCase()) ||
        sponsor.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({
      success: true,
      data: filteredSponsors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredSponsors.length,
        pages: Math.ceil(filteredSponsors.length / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('❌ Failed to get sponsors: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get sponsors',
      error: error.message
    });
  }
});

// Get sponsor by ID
router.get('/:id', async (req, res) => {
  try {
    const sponsor = await FirebaseService.getById('sponsors', req.params.id);
    
    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }
    
    res.json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    logger.error('❌ Failed to get sponsor: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get sponsor',
      error: error.message
    });
  }
});

// Create new sponsor
router.post('/', [
  // authenticateToken,
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('company').trim().isLength({ min: 2 }).withMessage('Company must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('category').isIn(['premium', 'bidding', 'promotional', 'standard']).withMessage('Valid category is required'),
  body('tier').isIn(['gold', 'silver', 'bronze', 'basic']).withMessage('Valid tier is required')
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
    
    const sponsorData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      viewCount: 0,
      scanCount: 0,
      arActivationCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const newSponsor = await FirebaseService.create('sponsors', sponsorData);
    
    res.status(201).json({
      success: true,
      message: 'Sponsor created successfully',
      data: newSponsor
    });
  } catch (error) {
    logger.error('❌ Failed to create sponsor: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create sponsor',
      error: error.message
    });
  }
});

// Update sponsor
router.put('/:id', [
  authenticateToken,
  body('name').optional().trim().isLength({ min: 2 }),
  body('company').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail(),
  body('category').optional().isIn(['premium', 'bidding', 'promotional', 'standard']),
  body('tier').optional().isIn(['gold', 'silver', 'bronze', 'basic'])
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
    const updatedSponsor = await FirebaseService.update('sponsors', req.params.id, updateData);
    
    res.json({
      success: true,
      message: 'Sponsor updated successfully',
      data: updatedSponsor
    });
  } catch (error) {
    logger.error('❌ Failed to update sponsor: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update sponsor',
      error: error.message
    });
  }
});

// Delete sponsor
router.delete('/:id', [authenticateToken], async (req, res) => {
  try {
    await FirebaseService.delete('sponsors', req.params.id);
    
    res.json({
      success: true,
      message: 'Sponsor deleted successfully'
    });
  } catch (error) {
    logger.error('❌ Failed to delete sponsor: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sponsor',
      error: error.message
    });
  }
});

// Upload sponsor assets
router.post('/:id/assets', [authenticateToken, uploadSponsorAssets], async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    const assetUrls = files.map(file => file.path);
    
    await FirebaseService.update('sponsors', id, {
      assets: assetUrls,
      updatedAt: new Date()
    });
    
    res.json({
      success: true,
      message: 'Assets uploaded successfully',
      data: { assetUrls }
    });
  } catch (error) {
    logger.error('❌ Failed to upload sponsor assets: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload assets',
      error: error.message
    });
  }
});

// Get sponsor performance
router.get('/:id/performance', async (req, res) => {
  try {
    const sponsor = await FirebaseService.getById('sponsors', req.params.id);
    
    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }
    
    const performance = {
      sponsorId: sponsor.id,
      name: sponsor.name,
      company: sponsor.company,
      viewCount: sponsor.viewCount || 0,
      scanCount: sponsor.scanCount || 0,
      arActivationCount: sponsor.arActivationCount || 0,
      totalInteractions: (sponsor.viewCount || 0) + (sponsor.scanCount || 0) + (sponsor.arActivationCount || 0),
      engagementRate: sponsor.viewCount > 0 ? ((sponsor.scanCount + sponsor.arActivationCount) / sponsor.viewCount) * 100 : 0,
      lastUpdated: sponsor.updatedAt
    };
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    logger.error('❌ Failed to get sponsor performance: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get sponsor performance',
      error: error.message
    });
  }
});

// Get top performing sponsors
router.get('/top/performers', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const sponsors = await FirebaseService.getAll('sponsors', {
      orderBy: { field: 'viewCount', direction: 'desc' },
      limit: parseInt(limit)
    });
    
    const topPerformers = sponsors.map(sponsor => ({
      id: sponsor.id,
      name: sponsor.name,
      company: sponsor.company,
      category: sponsor.category,
      tier: sponsor.tier,
      viewCount: sponsor.viewCount || 0,
      scanCount: sponsor.scanCount || 0,
      arActivationCount: sponsor.arActivationCount || 0,
      totalInteractions: (sponsor.viewCount || 0) + (sponsor.scanCount || 0) + (sponsor.arActivationCount || 0)
    }));
    
    res.json({
      success: true,
      data: topPerformers
    });
  } catch (error) {
    logger.error('❌ Failed to get top performers: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get top performers',
      error: error.message
    });
  }
});

// Get sponsors by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    const sponsors = await FirebaseService.getAll('sponsors', {
      where: [{ field: 'category', operator: '==', value: category }],
      orderBy: { field: 'name', direction: 'asc' },
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: sponsors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sponsors.length,
        pages: Math.ceil(sponsors.length / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('❌ Failed to get sponsors by category: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get sponsors by category',
      error: error.message
    });
  }
});

// Update bidding information
router.put('/:id/bidding', [
  authenticateToken,
  body('currentBid').isFloat({ min: 0 }).withMessage('Valid bid amount is required'),
  body('bidHistory').optional().isArray(),
  body('auctionEndTime').optional().isISO8601()
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
      bidding: {
        currentBid: req.body.currentBid,
        bidHistory: req.body.bidHistory || [],
        auctionEndTime: req.body.auctionEndTime || null,
        lastBidTime: new Date()
      },
      updatedAt: new Date()
    };
    
    const updatedSponsor = await FirebaseService.update('sponsors', req.params.id, updateData);
    
    res.json({
      success: true,
      message: 'Bidding information updated successfully',
      data: updatedSponsor
    });
  } catch (error) {
    logger.error('❌ Failed to update bidding information: ' + error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update bidding information',
      error: error.message
    });
  }
});

module.exports = router;
