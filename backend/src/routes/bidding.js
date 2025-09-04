const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');

// Mock bidding data (replace with actual database operations)
let bids = [
  {
    id: '1',
    slotId: '8',
    slotNumber: 8,
    sponsorId: 'sponsor-1',
    sponsorName: 'TechCorp',
    bidAmount: 1500.00,
    currency: 'USD',
    bidStatus: 'active',
    bidType: 'premium',
    startTime: new Date('2024-01-01T10:00:00Z'),
    endTime: new Date('2024-01-01T14:00:00Z'),
    minimumBid: 1000.00,
    currentHighestBid: 1500.00,
    totalBids: 3,
    bidders: ['sponsor-1', 'sponsor-2', 'sponsor-3'],
    autoExtend: true,
    extendThreshold: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    slotId: '24',
    slotNumber: 24,
    sponsorId: 'sponsor-2',
    sponsorName: 'BrandMax',
    bidAmount: 2200.00,
    currency: 'USD',
    bidStatus: 'active',
    bidType: 'premium',
    startTime: new Date('2024-01-01T18:00:00Z'),
    endTime: new Date('2024-01-01T22:00:00Z'),
    minimumBid: 1500.00,
    currentHighestBid: 2200.00,
    totalBids: 5,
    bidders: ['sponsor-2', 'sponsor-4', 'sponsor-5', 'sponsor-6', 'sponsor-7'],
    autoExtend: true,
    extendThreshold: 5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let bidHistory = [
  {
    id: '1',
    bidId: '1',
    slotId: '8',
    sponsorId: 'sponsor-1',
    sponsorName: 'TechCorp',
    bidAmount: 1200.00,
    bidTime: new Date('2024-01-01T10:15:00Z'),
    bidStatus: 'outbid'
  },
  {
    id: '2',
    bidId: '1',
    slotId: '8',
    sponsorId: 'sponsor-2',
    sponsorName: 'BrandMax',
    bidAmount: 1300.00,
    bidTime: new Date('2024-01-01T10:20:00Z'),
    bidStatus: 'outbid'
  },
  {
    id: '3',
    bidId: '1',
    slotId: '8',
    sponsorId: 'sponsor-1',
    sponsorName: 'TechCorp',
    bidAmount: 1500.00,
    bidTime: new Date('2024-01-01T10:25:00Z'),
    bidStatus: 'current'
  }
];

// Validation middleware
const validateBid = [
  body('slotId').isString().withMessage('Slot ID is required'),
  body('bidAmount').isFloat({ min: 0.01 }).withMessage('Bid amount must be a positive number'),
  body('currency').isIn(['USD', 'EUR', 'GBP']).withMessage('Currency must be USD, EUR, or GBP'),
  body('bidType').isIn(['standard', 'premium', 'exclusive']).withMessage('Bid type must be standard, premium, or exclusive')
];

// Get all active bids
router.get('/', async (req, res) => {
  try {
    logger.info('GET /api/bidding - Retrieving all active bids');
    
    const { slotId, status, type } = req.query;
    let filteredBids = [...bids];
    
    if (slotId) {
      filteredBids = filteredBids.filter(bid => bid.slotId === slotId);
    }
    
    if (status) {
      filteredBids = filteredBids.filter(bid => bid.bidStatus === status);
    }
    
    if (type) {
      filteredBids = filteredBids.filter(bid => bid.bidType === type);
    }
    
    res.json({
      success: true,
      data: filteredBids,
      count: filteredBids.length,
      total: bids.length
    });
  } catch (error) {
    logger.error('Error retrieving bids:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get bid by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`GET /api/bidding/${id} - Retrieving bid`);
    
    const bid = bids.find(b => b.id === id);
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found',
        message: `Bid with ID ${id} does not exist`
      });
    }
    
    res.json({
      success: true,
      data: bid
    });
  } catch (error) {
    logger.error(`Error retrieving bid ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Place new bid
router.post('/', authenticateToken, requireRole(['admin', 'operator', 'sponsor']), validateBid, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: errors.array()
      });
    }
    
    const { slotId, bidAmount, currency, bidType, autoExtend, extendThreshold } = req.body;
    const sponsorId = req.user.id; // From JWT token
    const sponsorName = req.user.company || 'Unknown Sponsor';
    
    logger.info(`POST /api/bidding - Placing new bid for slot ${slotId} by ${sponsorName}`);
    
    // Check if slot is available for bidding
    const existingBid = bids.find(bid => bid.slotId === slotId && bid.bidStatus === 'active');
    
    if (existingBid) {
      // Check if bid amount is higher than current highest bid
      if (bidAmount <= existingBid.currentHighestBid) {
        return res.status(400).json({
          success: false,
          error: 'Bid too low',
          message: `Bid amount must be higher than current highest bid: ${existingBid.currentHighestBid} ${existingBid.currency}`
        });
      }
      
      // Update existing bid
      existingBid.currentHighestBid = bidAmount;
      existingBid.totalBids += 1;
      existingBid.bidders.push(sponsorId);
      existingBid.updatedAt = new Date();
      
      // Add to bid history
      bidHistory.push({
        id: Date.now().toString(),
        bidId: existingBid.id,
        slotId,
        sponsorId,
        sponsorName,
        bidAmount,
        bidTime: new Date(),
        bidStatus: 'current'
      });
      
      // Update previous highest bid status
      const previousHighest = bidHistory.find(h => 
        h.bidId === existingBid.id && h.bidStatus === 'current' && h.sponsorId !== sponsorId
      );
      if (previousHighest) {
        previousHighest.bidStatus = 'outbid';
      }
      
      logger.info(`Bid updated successfully for slot ${slotId}: ${bidAmount} ${currency}`);
      res.json({
        success: true,
        data: existingBid,
        message: 'Bid placed successfully'
      });
    } else {
      // Create new bid
      const newBid = {
        id: Date.now().toString(),
        slotId,
        slotNumber: parseInt(slotId),
        sponsorId,
        sponsorName,
        bidAmount,
        currency,
        bidStatus: 'active',
        bidType: bidType || 'standard',
        startTime: new Date(),
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        minimumBid: bidAmount * 0.8, // 80% of initial bid
        currentHighestBid: bidAmount,
        totalBids: 1,
        bidders: [sponsorId],
        autoExtend: autoExtend !== undefined ? autoExtend : true,
        extendThreshold: extendThreshold || 5,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      bids.push(newBid);
      
      // Add to bid history
      bidHistory.push({
        id: Date.now().toString(),
        bidId: newBid.id,
        slotId,
        sponsorId,
        sponsorName,
        bidAmount,
        bidTime: new Date(),
        bidStatus: 'current'
      });
      
      logger.info(`New bid created successfully for slot ${slotId}: ${bidAmount} ${currency}`);
      res.status(201).json({
        success: true,
        data: newBid,
        message: 'Bid created successfully'
      });
    }
  } catch (error) {
    logger.error('Error placing bid:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Update bid
router.put('/:id', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { bidStatus, endTime, minimumBid, autoExtend, extendThreshold } = req.body;
    logger.info(`PUT /api/bidding/${id} - Updating bid`);
    
    const bidIndex = bids.findIndex(b => b.id === id);
    
    if (bidIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found',
        message: `Bid with ID ${id} does not exist`
      });
    }
    
    const updatedBid = {
      ...bids[bidIndex],
      bidStatus: bidStatus || bids[bidIndex].bidStatus,
      endTime: endTime ? new Date(endTime) : bids[bidIndex].endTime,
      minimumBid: minimumBid || bids[bidIndex].minimumBid,
      autoExtend: autoExtend !== undefined ? autoExtend : bids[bidIndex].autoExtend,
      extendThreshold: extendThreshold || bids[bidIndex].extendThreshold,
      updatedAt: new Date()
    };
    
    bids[bidIndex] = updatedBid;
    
    logger.info(`Bid updated successfully: ${id}`);
    res.json({
      success: true,
      data: updatedBid,
      message: 'Bid updated successfully'
    });
  } catch (error) {
    logger.error(`Error updating bid ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Cancel bid
router.delete('/:id', authenticateToken, requireRole(['admin', 'operator', 'sponsor']), async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`DELETE /api/bidding/${id} - Cancelling bid`);
    
    const bidIndex = bids.findIndex(b => b.id === id);
    
    if (bidIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found',
        message: `Bid with ID ${id} does not exist`
      });
    }
    
    const bid = bids[bidIndex];
    
    // Check if user can cancel this bid
    if (req.user.role !== 'admin' && req.user.role !== 'operator' && bid.sponsorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
        message: 'You can only cancel your own bids'
      });
    }
    
    // Update bid status
    bid.bidStatus = 'cancelled';
    bid.updatedAt = new Date();
    
    // Update bid history
    const currentBid = bidHistory.find(h => h.bidId === id && h.bidStatus === 'current');
    if (currentBid) {
      currentBid.bidStatus = 'cancelled';
    }
    
    logger.info(`Bid cancelled successfully: ${id}`);
    res.json({
      success: true,
      message: 'Bid cancelled successfully',
      cancelledBid: bid
    });
  } catch (error) {
    logger.error(`Error cancelling bid ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get active bidding sessions
router.get('/active', async (req, res) => {
  try {
    logger.info('GET /api/bidding/active - Retrieving active bidding sessions');
    
    const activeBids = bids.filter(bid => bid.bidStatus === 'active');
    
    // Add time remaining for each bid
    const bidsWithTimeRemaining = activeBids.map(bid => {
      const now = new Date();
      const endTime = new Date(bid.endTime);
      const timeRemaining = Math.max(0, endTime - now);
      
      return {
        ...bid,
        timeRemaining: timeRemaining,
        timeRemainingFormatted: formatTimeRemaining(timeRemaining),
        isExpiringSoon: timeRemaining < 5 * 60 * 1000 // Less than 5 minutes
      };
    });
    
    res.json({
      success: true,
      data: bidsWithTimeRemaining,
      count: bidsWithTimeRemaining.length
    });
  } catch (error) {
    logger.error('Error retrieving active bidding sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get bidding history
router.get('/history', async (req, res) => {
  try {
    logger.info('GET /api/bidding/history - Retrieving bidding history');
    
    const { slotId, sponsorId, limit = 50 } = req.query;
    let filteredHistory = [...bidHistory];
    
    if (slotId) {
      filteredHistory = filteredHistory.filter(history => history.slotId === slotId);
    }
    
    if (sponsorId) {
      filteredHistory = filteredHistory.filter(history => history.sponsorId === sponsorId);
    }
    
    // Sort by bid time (newest first) and limit results
    filteredHistory.sort((a, b) => new Date(b.bidTime) - new Date(a.bidTime));
    filteredHistory = filteredHistory.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: filteredHistory,
      count: filteredHistory.length,
      total: bidHistory.length
    });
  } catch (error) {
    logger.error('Error retrieving bidding history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get bid winners
router.get('/winners', async (req, res) => {
  try {
    logger.info('GET /api/bidding/winners - Retrieving bid winners');
    
    const { period = '24h' } = req.query;
    
    // Get completed bids (status: completed or expired)
    const completedBids = bids.filter(bid => 
      bid.bidStatus === 'completed' || 
      bid.bidStatus === 'expired' ||
      new Date(bid.endTime) < new Date()
    );
    
    const winners = completedBids.map(bid => {
      const winningBid = bidHistory.find(h => 
        h.bidId === bid.id && h.bidStatus === 'current'
      );
      
      return {
        bidId: bid.id,
        slotId: bid.slotId,
        slotNumber: bid.slotNumber,
        winnerId: winningBid ? winningBid.sponsorId : null,
        winnerName: winningBid ? winningBid.sponsorName : 'No winner',
        winningAmount: winningBid ? winningBid.bidAmount : 0,
        currency: bid.currency,
        endTime: bid.endTime,
        totalBids: bid.totalBids,
        status: bid.bidStatus
      };
    });
    
    res.json({
      success: true,
      data: winners,
      count: winners.length
    });
  } catch (error) {
    logger.error('Error retrieving bid winners:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Accept bid
router.post('/:id/accept', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(`POST /api/bidding/${id}/accept - Accepting bid`);
    
    const bid = bids.find(b => b.id === id);
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found',
        message: `Bid with ID ${id} does not exist`
      });
    }
    
    if (bid.bidStatus !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Bid not active',
        message: 'Only active bids can be accepted'
      });
    }
    
    // Update bid status
    bid.bidStatus = 'accepted';
    bid.updatedAt = new Date();
    
    // Update bid history
    const currentBid = bidHistory.find(h => h.bidId === id && h.bidStatus === 'current');
    if (currentBid) {
      currentBid.bidStatus = 'accepted';
    }
    
    logger.info(`Bid accepted successfully: ${id}`);
    res.json({
      success: true,
      data: bid,
      message: 'Bid accepted successfully'
    });
  } catch (error) {
    logger.error(`Error accepting bid ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Reject bid
router.post('/:id/reject', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    logger.info(`POST /api/bidding/${id}/reject - Rejecting bid`);
    
    const bid = bids.find(b => b.id === id);
    
    if (!bid) {
      return res.status(404).json({
        success: false,
        error: 'Bid not found',
        message: `Bid with ID ${id} does not exist`
      });
    }
    
    if (bid.bidStatus !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Bid not active',
        message: 'Only active bids can be rejected'
      });
    }
    
    // Update bid status
    bid.bidStatus = 'rejected';
    bid.updatedAt = new Date();
    
    // Update bid history
    const currentBid = bidHistory.find(h => h.bidId === id && h.bidStatus === 'current');
    if (currentBid) {
      currentBid.bidStatus = 'rejected';
    }
    
    logger.info(`Bid rejected successfully: ${id}, reason: ${reason || 'No reason provided'}`);
    res.json({
      success: true,
      data: bid,
      message: 'Bid rejected successfully',
      reason: reason || 'No reason provided'
    });
  } catch (error) {
    logger.error(`Error rejecting bid ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Get bidding analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    logger.info('GET /api/bidding/analytics - Retrieving bidding analytics');
    
    const { period = '24h' } = req.query;
    
    // Mock analytics data (replace with actual analytics)
    const analytics = {
      period,
      totalBids: bids.length,
      activeBids: bids.filter(b => b.bidStatus === 'active').length,
      completedBids: bids.filter(b => b.bidStatus === 'completed').length,
      totalBidAmount: bids.reduce((sum, bid) => sum + bid.currentHighestBid, 0),
      averageBidAmount: bids.length > 0 ? bids.reduce((sum, bid) => sum + bid.currentHighestBid, 0) / bids.length : 0,
      topBiddingSlots: bids
        .sort((a, b) => b.currentHighestBid - a.currentHighestBid)
        .slice(0, 5)
        .map(bid => ({
          slotId: bid.slotId,
          slotNumber: bid.slotNumber,
          highestBid: bid.currentHighestBid,
          totalBids: bid.totalBids
        })),
      bidTypeBreakdown: bids.reduce((acc, bid) => {
        acc[bid.bidType] = (acc[bid.bidType] || 0) + 1;
        return acc;
      }, {}),
      timeBasedAnalytics: {
        hourly: generateHourlyBiddingData(),
        daily: generateDailyBiddingData()
      }
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error retrieving bidding analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Helper functions
function formatTimeRemaining(milliseconds) {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

function generateHourlyBiddingData() {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      hour: i,
      bidCount: Math.floor(Math.random() * 10),
      totalAmount: Math.floor(Math.random() * 5000)
    });
  }
  return data;
}

function generateDailyBiddingData() {
  const data = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  for (let i = 0; i < 7; i++) {
    data.push({
      day: days[i],
      bidCount: Math.floor(Math.random() * 50),
      totalAmount: Math.floor(Math.random() * 25000)
    });
  }
  return data;
}

module.exports = router;
