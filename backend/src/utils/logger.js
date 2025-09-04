const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for file logs (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = 'logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: format
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // HTTP requests log file
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: fileFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format: fileFormat,
  transports,
  exitOnError: false
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Add custom methods for specific logging needs
logger.logSlotEvent = (eventType, slotNumber, details = {}) => {
  logger.info(`🎯 Slot Event: ${eventType}`, {
    slotNumber,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logSponsorEvent = (eventType, sponsorName, details = {}) => {
  logger.info(`🏢 Sponsor Event: ${eventType}`, {
    sponsorName,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logDeviceEvent = (eventType, deviceType, deviceId, details = {}) => {
  logger.info(`📱 Device Event: ${eventType}`, {
    deviceType,
    deviceId,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logSyncEvent = (eventType, deviceId, details = {}) => {
  logger.info(`🔄 Sync Event: ${eventType}`, {
    deviceId,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logAREvent = (eventType, slotNumber, modelType, details = {}) => {
  logger.info(`🎯 AR Event: ${eventType}`, {
    slotNumber,
    modelType,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logQREvent = (eventType, slotNumber, qrCode, details = {}) => {
  logger.info(`📱 QR Event: ${eventType}`, {
    slotNumber,
    qrCode,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logPerformance = (metric, value, details = {}) => {
  logger.info(`📊 Performance: ${metric} = ${value}`, {
    metric,
    value,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logSecurity = (eventType, userId, ipAddress, details = {}) => {
  logger.warn(`🔒 Security Event: ${eventType}`, {
    userId,
    ipAddress,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logDatabase = (operation, collection, details = {}) => {
  logger.debug(`🗄️ Database: ${operation} on ${collection}`, {
    operation,
    collection,
    timestamp: new Date().toISOString(),
    ...details
  });
};

logger.logAPI = (method, endpoint, statusCode, responseTime, details = {}) => {
  const level = statusCode >= 400 ? 'warn' : 'http';
  logger[level](`🌐 API: ${method} ${endpoint} - ${statusCode} (${responseTime}ms)`, {
    method,
    endpoint,
    statusCode,
    responseTime,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Error logging with stack trace
logger.logError = (error, context = {}) => {
  logger.error('❌ Error occurred', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: error.code,
    timestamp: new Date().toISOString(),
    ...context
  });
};

// Request logging middleware
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.logAPI(req.method, req.originalUrl, res.statusCode, duration, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || 'anonymous'
    });
  });
  
  next();
};

// Unhandled error logging
process.on('uncaughtException', (error) => {
  logger.logError(error, { type: 'uncaughtException' });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.logError(new Error(reason), { 
    type: 'unhandledRejection',
    promise: promise.toString()
  });
  process.exit(1);
});

module.exports = { logger };
