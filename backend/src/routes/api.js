const express = require('express');
const router = express.Router();

/**
 * @route   GET /api
 * @desc    API Overview and Documentation
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    name: 'BeamerShow 24-Slot System API',
    version: '2.0.0',
    description: 'Complete API for managing 24-slot rotating advertisement system with AR/AI/Hologram capabilities',
    baseUrl: '/api',
    endpoints: {
      auth: {
        base: '/auth',
        description: 'User authentication and authorization',
        endpoints: [
          { method: 'POST', path: '/register', description: 'User registration' },
          { method: 'POST', path: '/login', description: 'User login' },
          { method: 'GET', path: '/profile', description: 'Get user profile', auth: true },
          { method: 'PUT', path: '/profile', description: 'Update user profile', auth: true },
          { method: 'POST', path: '/change-password', description: 'Change password', auth: true },
          { method: 'POST', path: '/refresh', description: 'Refresh JWT token' },
          { method: 'POST', path: '/logout', description: 'User logout', auth: true },
          { method: 'GET', path: '/users', description: 'Get all users (admin only)', auth: true, role: 'admin' }
        ]
      },
      slots: {
        base: '/slots',
        description: '24-slot management and configuration',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all slots' },
          { method: 'GET', path: '/:id', description: 'Get slot by ID' },
          { method: 'GET', path: '/number/:slotNumber', description: 'Get slot by number (1-24)' },
          { method: 'POST', path: '/', description: 'Create new slot', auth: true },
          { method: 'PUT', path: '/:id', description: 'Update slot', auth: true },
          { method: 'DELETE', path: '/:id', description: 'Delete slot', auth: true, role: 'admin' },
          { method: 'GET', path: '/active/current', description: 'Get currently active slot' },
          { method: 'GET', path: '/block/:blockId', description: 'Get slots in specific block' },
          { method: 'PATCH', path: '/:id/layers', description: 'Update slot layer configuration', auth: true },
          { method: 'GET', path: '/:id/performance', description: 'Get slot performance metrics' },
          { method: 'POST', path: '/:id/activate', description: 'Activate slot', auth: true },
          { method: 'POST', path: '/:id/deactivate', description: 'Deactivate slot', auth: true },
          { method: 'GET', path: '/available', description: 'Get available slots for booking' },
          { method: 'POST', path: '/:id/book', description: 'Book slot for sponsor', auth: true },
          { method: 'POST', path: '/:id/release', description: 'Release slot booking', auth: true }
        ]
      },
      sponsors: {
        base: '/sponsors',
        description: 'Sponsor management and content',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all sponsors' },
          { method: 'GET', path: '/:id', description: 'Get sponsor by ID' },
          { method: 'POST', path: '/', description: 'Create new sponsor', auth: true },
          { method: 'PUT', path: '/:id', description: 'Update sponsor', auth: true },
          { method: 'DELETE', path: '/:id', description: 'Delete sponsor', auth: true, role: 'admin' },
          { method: 'POST', path: '/:id/assets', description: 'Upload sponsor assets', auth: true },
          { method: 'GET', path: '/:id/performance', description: 'Get sponsor performance metrics' },
          { method: 'GET', path: '/top/performers', description: 'Get top performing sponsors' },
          { method: 'GET', path: '/category/:category', description: 'Get sponsors by category' },
          { method: 'PATCH', path: '/:id/bidding', description: 'Update sponsor bidding info', auth: true },
          { method: 'GET', path: '/:id/slots', description: 'Get slots associated with sponsor' },
          { method: 'POST', path: '/:id/contact', description: 'Send contact message to sponsor', auth: true },
          { method: 'GET', path: '/search', description: 'Search sponsors by criteria' },
          { method: 'GET', path: '/analytics/overview', description: 'Get sponsor analytics overview', auth: true }
        ]
      },
      analytics: {
        base: '/analytics',
        description: 'Comprehensive analytics and reporting',
        endpoints: [
          { method: 'GET', path: '/overview', description: 'Get analytics overview', auth: true },
          { method: 'GET', path: '/slots/performance', description: 'Get slot performance analytics', auth: true },
          { method: 'GET', path: '/sponsors/performance', description: 'Get sponsor performance analytics', auth: true },
          { method: 'GET', path: '/realtime', description: 'Get real-time analytics data', auth: true },
          { method: 'GET', path: '/devices', description: 'Get device analytics', auth: true },
          { method: 'GET', path: '/timeline', description: 'Get analytics timeline', auth: true },
          { method: 'POST', path: '/export', description: 'Export analytics data', auth: true },
          { method: 'POST', path: '/query', description: 'Custom analytics query', auth: true },
          { method: 'GET', path: '/kpis', description: 'Get key performance indicators', auth: true },
          { method: 'GET', path: '/reports/daily', description: 'Get daily report', auth: true },
          { method: 'GET', path: '/reports/weekly', description: 'Get weekly report', auth: true },
          { method: 'GET', path: '/reports/monthly', description: 'Get monthly report', auth: true },
          { method: 'GET', path: '/heatmap', description: 'Get slot usage heatmap', auth: true },
          { method: 'GET', path: '/trends', description: 'Get performance trends', auth: true }
        ]
      },
      sync: {
        base: '/sync',
        description: 'Device synchronization and real-time updates',
        endpoints: [
          { method: 'GET', path: '/status', description: 'Get sync status', auth: true },
          { method: 'GET', path: '/device/:deviceId', description: 'Get device sync info', auth: true },
          { method: 'POST', path: '/device/:deviceId/sync', description: 'Force sync to device', auth: true },
          { method: 'GET', path: '/history', description: 'Get sync history', auth: true },
          { method: 'GET', path: '/performance', description: 'Get sync performance metrics', auth: true },
          { method: 'GET', path: '/devices', description: 'Get all connected devices', auth: true },
          { method: 'POST', path: '/device/:deviceId/disconnect', description: 'Disconnect device', auth: true },
          { method: 'POST', path: '/broadcast', description: 'Broadcast message to all devices', auth: true },
          { method: 'GET', path: '/latency', description: 'Get sync latency metrics', auth: true },
          { method: 'POST', path: '/device/:deviceId/configure', description: 'Configure device settings', auth: true }
        ]
      },
      blocks: {
        base: '/blocks',
        description: '4-hour block management and scheduling',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all blocks' },
          { method: 'GET', path: '/:id', description: 'Get block by ID' },
          { method: 'POST', path: '/', description: 'Create new block', auth: true },
          { method: 'PUT', path: '/:id', description: 'Update block', auth: true },
          { method: 'DELETE', path: '/:id', description: 'Delete block', auth: true, role: 'admin' },
          { method: 'GET', path: '/current', description: 'Get current active block' },
          { method: 'GET', path: '/schedule', description: 'Get block schedule' },
          { method: 'POST', path: '/:id/activate', description: 'Activate block', auth: true },
          { method: 'POST', path: '/:id/deactivate', description: 'Deactivate block', auth: true },
          { method: 'GET', path: '/:id/slots', description: 'Get slots in block' },
          { method: 'POST', path: '/:id/rotate', description: 'Rotate slots in block', auth: true },
          { method: 'GET', path: '/:id/performance', description: 'Get block performance metrics', auth: true }
        ]
      },
      ar: {
        base: '/ar',
        description: 'AR content and activation management',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all AR content' },
          { method: 'GET', path: '/:id', description: 'Get AR content by ID' },
          { method: 'POST', path: '/', description: 'Create AR content', auth: true },
          { method: 'PUT', path: '/:id', description: 'Update AR content', auth: true },
          { method: 'DELETE', path: '/:id', description: 'Delete AR content', auth: true },
          { method: 'POST', path: '/:id/activate', description: 'Activate AR content' },
          { method: 'GET', path: '/:id/analytics', description: 'Get AR content analytics' },
          { method: 'POST', path: '/:id/upload', description: 'Upload AR model files', auth: true },
          { method: 'GET', path: '/triggers', description: 'Get AR triggers (QR/NFC)' },
          { method: 'POST', path: '/triggers', description: 'Create AR trigger', auth: true },
          { method: 'GET', path: '/models', description: 'Get available AR models' },
          { method: 'POST', path: '/scan', description: 'Process AR scan/trigger' },
          { method: 'GET', path: '/performance', description: 'Get AR performance metrics', auth: true }
        ]
      },
      hologram: {
        base: '/hologram',
        description: 'Hologram content and effects management',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all hologram content' },
          { method: 'GET', path: '/:id', description: 'Get hologram content by ID' },
          { method: 'POST', path: '/', description: 'Create hologram content', auth: true },
          { method: 'PUT', path: '/:id', description: 'Update hologram content', auth: true },
          { method: 'DELETE', path: '/:id', description: 'Delete hologram content', auth: true },
          { method: 'POST', path: '/:id/upload', description: 'Upload hologram video files', auth: true },
          { method: 'GET', path: '/:id/effects', description: 'Get hologram effects' },
          { method: 'POST', path: '/:id/effects', description: 'Configure hologram effects', auth: true },
          { method: 'GET', path: '/:id/performance', description: 'Get hologram performance metrics' },
          { method: 'POST', path: '/:id/activate', description: 'Activate hologram content' },
          { method: 'GET', path: '/templates', description: 'Get hologram effect templates' },
          { method: 'POST', path: '/templates', description: 'Create hologram effect template', auth: true }
        ]
      },
      qr: {
        base: '/qr',
        description: 'QR code generation and management',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all QR codes' },
          { method: 'GET', path: '/:id', description: 'Get QR code by ID' },
          { method: 'POST', path: '/', description: 'Generate new QR code', auth: true },
          { method: 'PUT', path: '/:id', description: 'Update QR code', auth: true },
          { method: 'DELETE', path: '/:id', description: 'Delete QR code', auth: true },
          { method: 'GET', path: '/:id/image', description: 'Get QR code image' },
          { method: 'GET', path: '/:id/analytics', description: 'Get QR code scan analytics' },
          { method: 'POST', path: '/:id/scan', description: 'Record QR code scan' },
          { method: 'GET', path: '/batch', description: 'Generate multiple QR codes', auth: true },
          { method: 'POST', path: '/validate', description: 'Validate QR code' }
        ]
      },
      bidding: {
        base: '/bidding',
        description: 'Live bidding system for slots',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get all active bids' },
          { method: 'GET', path: '/:id', description: 'Get bid by ID' },
          { method: 'POST', path: '/', description: 'Place new bid', auth: true },
          { method: 'PUT', path: '/:id', description: 'Update bid', auth: true },
          { method: 'DELETE', path: '/:id', description: 'Cancel bid', auth: true },
          { method: 'GET', path: '/active', description: 'Get active bidding sessions' },
          { method: 'GET', path: '/history', description: 'Get bidding history' },
          { method: 'GET', path: '/winners', description: 'Get bid winners' },
          { method: 'POST', path: '/:id/accept', description: 'Accept bid', auth: true, role: 'admin' },
          { method: 'POST', path: '/:id/reject', description: 'Reject bid', auth: true, role: 'admin' },
          { method: 'GET', path: '/analytics', description: 'Get bidding analytics', auth: true }
        ]
      },
      notifications: {
        base: '/notifications',
        description: 'System notifications and alerts',
        endpoints: [
          { method: 'GET', path: '/', description: 'Get user notifications', auth: true },
          { method: 'GET', path: '/:id', description: 'Get notification by ID', auth: true },
          { method: 'PUT', path: '/:id/read', description: 'Mark notification as read', auth: true },
          { method: 'DELETE', path: '/:id', description: 'Delete notification', auth: true },
          { method: 'POST', path: '/send', description: 'Send notification', auth: true },
          { method: 'GET', path: '/settings', description: 'Get notification settings', auth: true },
          { method: 'PUT', path: '/settings', description: 'Update notification settings', auth: true },
          { method: 'POST', path: '/broadcast', description: 'Broadcast notification to all users', auth: true, role: 'admin' }
        ]
      },
      system: {
        base: '/system',
        description: 'System configuration and management',
        endpoints: [
          { method: 'GET', path: '/status', description: 'Get system status' },
          { method: 'GET', path: '/health', description: 'Get system health check' },
          { method: 'GET', path: '/config', description: 'Get system configuration', auth: true },
          { method: 'PUT', path: '/config', description: 'Update system configuration', auth: true, role: 'admin' },
          { method: 'GET', path: '/logs', description: 'Get system logs', auth: true, role: 'admin' },
          { method: 'POST', path: '/restart', description: 'Restart system services', auth: true, role: 'admin' },
          { method: 'GET', path: '/performance', description: 'Get system performance metrics', auth: true },
          { method: 'POST', path: '/backup', description: 'Create system backup', auth: true, role: 'admin' },
          { method: 'GET', path: '/updates', description: 'Check for system updates', auth: true },
          { method: 'POST', path: '/updates/install', description: 'Install system updates', auth: true, role: 'admin' }
        ]
      }
    },
    socketEvents: {
      clientToServer: [
        'register_device',
        'slot_view',
        'qr_scan',
        'nfc_trigger',
        'ar_activation',
        'sync_request',
        'bid_place',
        'notification_subscribe'
      ],
      serverToClient: [
        'system_status',
        'slot_update',
        'ar_trigger',
        'force_sync',
        'bid_update',
        'notification',
        'emergency_broadcast'
      ]
    },
    authentication: {
      type: 'JWT Bearer Token',
      header: 'Authorization: Bearer <token>',
      expiration: '24 hours (configurable)'
    },
    rateLimiting: {
      general: '100 requests per 15 minutes',
      auth: '5 requests per 15 minutes',
      upload: '10 requests per 15 minutes'
    },
    documentation: {
      swagger: '/api-docs',
      openapi: '/api-docs.json'
    }
  });
});

module.exports = router;
