import express, { Request, Response } from 'express';
import { ApiResponse } from '../types';

const router = express.Router();

/**
 * @route   GET /api
 * @desc    API Overview and Documentation
 * @access  Public
 */
router.get('/', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'BeamerShow 24-Slot System API',
    data: {
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
          description: 'Sponsor and company management',
          endpoints: [
            { method: 'GET', path: '/', description: 'Get all sponsors' },
            { method: 'GET', path: '/:id', description: 'Get sponsor by ID' },
            { method: 'POST', path: '/', description: 'Create new sponsor', auth: true },
            { method: 'PUT', path: '/:id', description: 'Update sponsor', auth: true },
            { method: 'DELETE', path: '/:id', description: 'Delete sponsor', auth: true, role: 'admin' },
            { method: 'GET', path: '/category/:category', description: 'Get sponsors by category' },
            { method: 'GET', path: '/tier/:tier', description: 'Get sponsors by tier' },
            { method: 'POST', path: '/:id/assets', description: 'Upload sponsor assets', auth: true },
            { method: 'PUT', path: '/:id/bidding', description: 'Update bidding information', auth: true }
          ]
        },
        bidding: {
          base: '/bidding',
          description: 'Live bidding system',
          endpoints: [
            { method: 'GET', path: '/', description: 'Get all bids' },
            { method: 'GET', path: '/slot/:slotId', description: 'Get bids for specific slot' },
            { method: 'GET', path: '/company/:companyId', description: 'Get bids by company' },
            { method: 'POST', path: '/', description: 'Place new bid', auth: true },
            { method: 'PUT', path: '/:id', description: 'Update bid', auth: true },
            { method: 'DELETE', path: '/:id', description: 'Withdraw bid', auth: true },
            { method: 'GET', path: '/active', description: 'Get active bids' },
            { method: 'GET', path: '/history/:slotId', description: 'Get bid history for slot' },
            { method: 'POST', path: '/:id/accept', description: 'Accept bid (admin only)', auth: true, role: 'admin' },
            { method: 'POST', path: '/:id/reject', description: 'Reject bid (admin only)', auth: true, role: 'admin' }
          ]
        },
        uploads: {
          base: '/uploads',
          description: 'File upload and management system',
          endpoints: [
            { method: 'POST', path: '/sponsors/:companyId', description: 'Upload sponsor assets (logos, images)', auth: true },
            { method: 'POST', path: '/ar-content', description: 'Upload AR content (3D models, configurations)', auth: true },
            { method: 'POST', path: '/slots/:slotId', description: 'Upload slot content and media', auth: true },
            { method: 'POST', path: '/holograms', description: 'Upload hologram assets and models', auth: true },
            { method: 'GET', path: '/files', description: 'List all uploaded files' },
            { method: 'GET', path: '/files/:fileId', description: 'Get file information' },
            { method: 'DELETE', path: '/files/:fileId', description: 'Delete uploaded file', auth: true },
            { method: 'GET', path: '/uploads/:type/:filename', description: 'Serve uploaded files' }
          ]
        },
        arContent: {
          base: '/ar-content',
          description: 'AR content and hologram effects management',
          endpoints: [
            { method: 'GET', path: '/', description: 'Get all AR content' },
            { method: 'GET', path: '/:id', description: 'Get AR content by ID' },
            { method: 'POST', path: '/', description: 'Create new AR content', auth: true },
            { method: 'PUT', path: '/:id', description: 'Update AR content', auth: true },
            { method: 'DELETE', path: '/:id', description: 'Delete AR content', auth: true, role: 'admin' },
            { method: 'GET', path: '/:id/hologram-effects', description: 'Get hologram effects for AR content' },
            { method: 'POST', path: '/:id/hologram-effects', description: 'Create hologram effect', auth: true },
            { method: 'PUT', path: '/hologram-effects/:effectId', description: 'Update hologram effect', auth: true },
            { method: 'DELETE', path: '/hologram-effects/:effectId', description: 'Delete hologram effect', auth: true, role: 'admin' },
            { method: 'POST', path: '/:id/activate', description: 'Activate AR content', auth: true },
            { method: 'POST', path: '/:id/deactivate', description: 'Deactivate AR content', auth: true }
          ]
        },
        analytics: {
          base: '/analytics',
          description: 'Analytics and performance tracking system',
          endpoints: [
            { method: 'GET', path: '/overview', description: 'Get analytics overview with key metrics' },
            { method: 'GET', path: '/events', description: 'Get analytics events with filtering and pagination' },
            { method: 'POST', path: '/events', description: 'Track analytics event' },
            { method: 'GET', path: '/slots/:slotId', description: 'Get analytics for specific slot' },
            { method: 'GET', path: '/companies/:companyId', description: 'Get analytics for specific company' },
            { method: 'GET', path: '/performance', description: 'Get performance metrics and KPIs' }
          ]
        },
        ar: {
          base: '/ar',
          description: 'AR content and hologram management',
          endpoints: [
            { method: 'GET', path: '/content', description: 'Get all AR content' },
            { method: 'GET', path: '/content/:id', description: 'Get AR content by ID' },
            { method: 'POST', path: '/content', description: 'Create AR content', auth: true },
            { method: 'PUT', path: '/content/:id', description: 'Update AR content', auth: true },
            { method: 'DELETE', path: '/content/:id', description: 'Delete AR content', auth: true, role: 'admin' },
            { method: 'GET', path: '/effects', description: 'Get hologram effects' },
            { method: 'POST', path: '/effects', description: 'Create hologram effect', auth: true },
            { method: 'PUT', path: '/effects/:id', description: 'Update hologram effect', auth: true },
            { method: 'POST', path: '/content/:id/upload', description: 'Upload AR model files', auth: true },
            { method: 'GET', path: '/triggers', description: 'Get AR triggers' },
            { method: 'POST', path: '/triggers', description: 'Create AR trigger', auth: true }
          ]
        },
        devices: {
          base: '/devices',
          description: 'Device management and multi-device coordination',
          endpoints: [
            { method: 'GET', path: '/', description: 'Get all devices' },
            { method: 'GET', path: '/:id', description: 'Get device by ID' },
            { method: 'GET', path: '/device-id/:deviceId', description: 'Get device by device ID' },
            { method: 'POST', path: '/', description: 'Create new device' },
            { method: 'PUT', path: '/:id', description: 'Update device' },
            { method: 'DELETE', path: '/:id', description: 'Delete device' },
            { method: 'POST', path: '/:id/heartbeat', description: 'Update device heartbeat' },
            { method: 'POST', path: '/:id/status', description: 'Update device status' },
            { method: 'GET', path: '/type/:deviceType', description: 'Get devices by type' },
            { method: 'GET', path: '/status/:status', description: 'Get devices by status' },
            { method: 'GET', path: '/stats/overview', description: 'Get device statistics overview' }
          ]
        },
        beamer: {
          base: '/beamer',
          description: 'Beamer device management',
          endpoints: [
            { method: 'GET', path: '/devices', description: 'Get all beamer devices' },
            { method: 'GET', path: '/devices/:deviceId', description: 'Get beamer device details' },
            { method: 'PUT', path: '/config/:deviceId', description: 'Update beamer configuration', auth: true },
            { method: 'POST', path: '/:deviceId/calibrate', description: 'Calibrate beamer', auth: true },
            { method: 'GET', path: '/:deviceId/status', description: 'Get beamer status' },
            { method: 'POST', path: '/:deviceId/test-pattern', description: 'Test beamer pattern', auth: true },
            { method: 'POST', path: '/:deviceId/power', description: 'Control beamer power', auth: true }
          ]
        },
        ipad: {
          base: '/ipad',
          description: 'iPad device management',
          endpoints: [
            { method: 'GET', path: '/devices', description: 'Get all iPad devices' },
            { method: 'GET', path: '/devices/:deviceId', description: 'Get iPad device details' },
            { method: 'PUT', path: '/config/:deviceId', description: 'Update iPad configuration', auth: true },
            { method: 'GET', path: '/:deviceId/status', description: 'Get iPad status' },
            { method: 'POST', path: '/:deviceId/orientation', description: 'Set iPad orientation', auth: true },
            { method: 'POST', path: '/:deviceId/brightness', description: 'Set iPad brightness', auth: true }
          ]
        },
        sync: {
          base: '/sync',
          description: 'Multi-device synchronization',
          endpoints: [
            { method: 'GET', path: '/status', description: 'Get sync status' },
            { method: 'POST', path: '/trigger', description: 'Trigger synchronization', auth: true },
            { method: 'GET', path: '/devices', description: 'Get connected devices' },
            { method: 'POST', path: '/devices/:deviceId/sync', description: 'Sync specific device' },
            { method: 'GET', path: '/logs', description: 'Get sync logs' }
          ]
        }
      },
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>',
        endpoints: [
          'POST /api/auth/register',
          'POST /api/auth/login'
        ]
      },
      rateLimiting: {
        description: 'API requests are rate limited',
        limits: {
          'authenticated': '1000 requests per hour',
          'unauthenticated': '100 requests per hour'
        }
      },
      websocket: {
        description: 'Real-time updates via Socket.IO',
        endpoint: 'ws://localhost:3001',
        events: [
          'slot_update',
          'bid_placed',
          'device_status',
          'sync_complete'
        ]
      }
    }
  };

  res.json(response);
});

export default router;
