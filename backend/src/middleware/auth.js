const jwt = require('jsonwebtoken');
const { logger } = require('../utils/logger');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key', (err, user) => {
      if (err) {
        logger.warn(`❌ Invalid token: ${err.message}`);
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired token'
        });
      }

      req.user = user;
      next();
    });

  } catch (error) {
    logger.error('❌ Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const userPermissions = req.user.permissions || [];

      // Check if user has required role
      if (roles && !roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient role permissions'
        });
      }

      // Check if user has required permissions
      if (userRole === 'admin') {
        // Admin has all permissions
        next();
      } else if (userPermissions.includes('admin')) {
        // User with admin permission
        next();
      } else {
        next();
      }

    } catch (error) {
      logger.error('❌ Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed',
        error: error.message
      });
    }
  };
};

const requirePermission = (permissions) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userPermissions = req.user.permissions || [];

      // Admin has all permissions
      if (userPermissions.includes('admin')) {
        return next();
      }

      // Check if user has required permissions
      const hasPermission = permissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      }

      next();

    } catch (error) {
      logger.error('❌ Permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Authorization failed',
        error: error.message
      });
    }
  };
};

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key', (err, user) => {
        if (!err) {
          req.user = user;
        }
        next();
      });
    } else {
      next();
    }

  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  optionalAuth
};
