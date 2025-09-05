import winston from 'winston';
import path from 'path';
import fs from 'fs';

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
const level = (): string => {
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
(logger as any).stream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Add custom methods for specific logging needs
(logger as any).logSlotEvent = (eventType: string, slotNumber: number, details: any = {}) => {
  logger.info(`Slot Event: ${eventType}`, {
    slotNumber,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logSponsorEvent = (eventType: string, sponsorName: string, details: any = {}) => {
  logger.info(`Sponsor Event: ${eventType}`, {
    sponsorName,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logDeviceEvent = (eventType: string, deviceType: string, deviceId: string, details: any = {}) => {
  logger.info(`Device Event: ${eventType}`, {
    deviceType,
    deviceId,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logSyncEvent = (eventType: string, deviceId: string, details: any = {}) => {
  logger.info(`Sync Event: ${eventType}`, {
    deviceId,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logAREvent = (eventType: string, slotNumber: number, modelType: string, details: any = {}) => {
  logger.info(`AR Event: ${eventType}`, {
    slotNumber,
    modelType,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logQREvent = (eventType: string, slotNumber: number, qrCode: string, details: any = {}) => {
  logger.info(`QR Event: ${eventType}`, {
    slotNumber,
    qrCode,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logPerformance = (metric: string, value: number, details: any = {}) => {
  logger.info(`Performance: ${metric} = ${value}`, {
    metric,
    value,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logSecurity = (eventType: string, userId: string, ipAddress: string, details: any = {}) => {
  logger.warn(`Security Event: ${eventType}`, {
    userId,
    ipAddress,
    eventType,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logDatabase = (operation: string, collection: string, details: any = {}) => {
  logger.debug(`Database: ${operation} on ${collection}`, {
    operation,
    collection,
    timestamp: new Date().toISOString(),
    ...details
  });
};

(logger as any).logAPI = (method: string, endpoint: string, statusCode: number, responseTime: number, details: any = {}) => {
  const level = statusCode >= 400 ? 'warn' : 'http';
  (logger as any)[level](`API: ${method} ${endpoint} - ${statusCode} (${responseTime}ms)`, {
    method,
    endpoint,
    statusCode,
    responseTime,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Error logging with stack trace
(logger as any).logError = (error: Error, context: any = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    code: (error as any).code,
    timestamp: new Date().toISOString(),
    ...context
  });
};

// Request logging middleware
(logger as any).logRequest = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    (logger as any).logAPI(req.method, req.originalUrl, res.statusCode, duration, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || 'anonymous'
    });
  });
  
  next();
};

// Unhandled error logging
process.on('uncaughtException', (error) => {
  (logger as any).logError(error, { type: 'uncaughtException' });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  (logger as any).logError(new Error(reason as string), { 
    type: 'unhandledRejection',
    promise: promise.toString()
  });
  process.exit(1);
});

export { logger };
