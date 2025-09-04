const { logger } = require('../utils/logger');

// Mock database configuration - no real database needed
const connectDatabase = async () => {
  try {
    logger.info('✅ Running in mock mode (no database connection)');
    return;
  } catch (error) {
    logger.error('❌ Database connection failed: ' + error.message);
    logger.info('✅ Continuing in mock mode');
  }
};

const checkDatabaseHealth = async () => {
  try {
    return { 
      status: 'mock', 
      type: 'mock', 
      message: 'Running in mock mode without database',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Database health check failed: ' + error.message);
    return { 
      status: 'mock', 
      type: 'mock', 
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = {
  connectDatabase,
  checkDatabaseHealth
};
