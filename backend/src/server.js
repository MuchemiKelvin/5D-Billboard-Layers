const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes and middleware
// const apiRoutes = require('./routes/api');
// const slotRoutes = require('./routes/slots');
// const sponsorRoutes = require('./routes/sponsors');
// const syncRoutes = require('./routes/sync');
// const analyticsRoutes = require('./routes/analytics');
// const authRoutes = require('./routes/auth');
// const blockRoutes = require('./routes/blocks');
// const arRoutes = require('./routes/ar');
// const biddingRoutes = require('./routes/bidding');
const { connectDatabase } = require('./config/database');
const { setupSocketHandlers } = require('./socket/handlers');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDatabase();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(rateLimiter);

// Static files for uploaded content
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Tester route
app.get('/api-tester', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/api-tester.html'));
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const { checkDatabaseHealth } = require('./config/database');
    const dbHealth = await checkDatabaseHealth();
    
    res.json({
      status: 'healthy',
      database: dbHealth,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      service: 'BeamerShow 24-Slot System'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: { status: 'error', type: 'unknown' },
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      service: 'BeamerShow 24-Slot System',
      error: error.message
    });
  }
});

// API Routes
// app.use('/api', apiRoutes);
// app.use('/api/slots', slotRoutes);
// app.use('/api/sponsors', sponsorRoutes);
// app.use('/api/sync', syncRoutes);
// app.use('/api/analytics', analyticsRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/blocks', blockRoutes);
// app.use('/api/ar', arRoutes);
// app.use('/api/bidding', biddingRoutes);
// app.use('/api/devices', require('./routes/devices'));
// app.use('/api/beamer', require('./routes/beamer'));
// app.use('/api/ipad', require('./routes/ipad'));

// Setup Socket.IO handlers
setupSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`🚀 BeamerShow Backend Server running on port ${PORT}`);
  logger.info(`📡 Socket.IO server initialized`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  logger.info(`🧪 API Tester: http://localhost:${PORT}/api-tester`);
  logger.info(`📊 Test all your APIs at: http://localhost:${PORT}/api-tester`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = { app, server, io };
