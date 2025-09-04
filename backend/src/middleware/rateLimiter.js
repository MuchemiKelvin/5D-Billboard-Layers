const { RateLimiterMemory } = require('rate-limiter-flexible');
const { logger } = require('../utils/logger');

// Create rate limiters for different endpoints
const createRateLimiter = (points, duration, blockDuration = 0) => {
  return new RateLimiterMemory({
    points, // Number of requests
    duration, // Per time window (in seconds)
    blockDuration, // Block duration if limit exceeded (in seconds)
    keyGenerator: (req) => {
      // Use IP address as key, or user ID if authenticated
      return req.user ? req.user.userId : req.ip;
    },
    onLimitReached: (req, res) => {
      logger.warn(`🚫 Rate limit exceeded for ${req.ip} - ${req.originalUrl}`);
    }
  });
};

// General API rate limiter
const generalLimiter = createRateLimiter(100, 60); // 100 requests per minute

// Authentication endpoints rate limiter (stricter)
const authLimiter = createRateLimiter(5, 60, 300); // 5 attempts per minute, block for 5 minutes

// File upload rate limiter
const uploadLimiter = createRateLimiter(10, 60); // 10 uploads per minute

// Analytics endpoints rate limiter
const analyticsLimiter = createRateLimiter(50, 60); // 50 requests per minute

// Socket connection rate limiter
const socketLimiter = createRateLimiter(20, 60); // 20 connections per minute

// Rate limiter middleware
const rateLimiter = async (req, res, next) => {
  try {
    let limiter = generalLimiter;

    // Choose appropriate limiter based on endpoint
    if (req.path.startsWith('/api/auth')) {
      limiter = authLimiter;
    } else if (req.path.includes('/upload') || req.path.includes('/assets')) {
      limiter = uploadLimiter;
    } else if (req.path.startsWith('/api/analytics')) {
      limiter = analyticsLimiter;
    }

    // Apply rate limiting
    await limiter.consume(req.ip);
    next();

  } catch (rejRes) {
    if (rejRes instanceof Error) {
      logger.error('❌ Rate limiter error:', rejRes);
      return res.status(500).json({
        success: false,
        message: 'Rate limiting error'
      });
    }

    // Rate limit exceeded
    const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
    res.set('Retry-After', retryAfter);
    
    return res.status(429).json({
      success: false,
      message: 'Too many requests',
      retryAfter,
      limit: {
        points: rejRes.totalPoints,
        duration: rejRes.duration,
        remaining: rejRes.remainingPoints
      }
    });
  }
};

// Socket rate limiter middleware
const socketRateLimiter = async (socket, next) => {
  try {
    await socketLimiter.consume(socket.handshake.address);
    next();
  } catch (rejRes) {
    if (rejRes instanceof Error) {
      logger.error('❌ Socket rate limiter error:', rejRes);
      return next(new Error('Rate limiting error'));
    }

    // Rate limit exceeded
    logger.warn(`🚫 Socket rate limit exceeded for ${socket.handshake.address}`);
    return next(new Error('Too many connection attempts'));
  }
};

// Custom rate limiter for specific endpoints
const createCustomRateLimiter = (points, duration, blockDuration = 0) => {
  const limiter = createRateLimiter(points, duration, blockDuration);
  
  return async (req, res, next) => {
    try {
      await limiter.consume(req.ip);
      next();
    } catch (rejRes) {
      if (rejRes instanceof Error) {
        logger.error('❌ Custom rate limiter error:', rejRes);
        return res.status(500).json({
          success: false,
          message: 'Rate limiting error'
        });
      }

      const retryAfter = Math.ceil(rejRes.msBeforeNext / 1000);
      res.set('Retry-After', retryAfter);
      
      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        retryAfter
      });
    }
  };
};

// Rate limiter for admin endpoints (stricter)
const adminRateLimiter = createCustomRateLimiter(30, 60); // 30 requests per minute

// Rate limiter for sync endpoints
const syncRateLimiter = createCustomRateLimiter(200, 60); // 200 requests per minute

// Rate limiter for slot operations
const slotRateLimiter = createCustomRateLimiter(150, 60); // 150 requests per minute

module.exports = {
  rateLimiter,
  socketRateLimiter,
  createCustomRateLimiter,
  adminRateLimiter,
  syncRateLimiter,
  slotRateLimiter
};
