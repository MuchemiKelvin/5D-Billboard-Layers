import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';
import crypto from 'crypto';

const router = express.Router();

// Validation middleware
const validateSyncRequest = [
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('data').isObject().withMessage('Sync data is required'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Invalid priority'),
  body('compression').optional().isBoolean().withMessage('Compression must be boolean')
];

const validateDeviceState = [
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('state').isObject().withMessage('Device state is required'),
  body('version').isInt({ min: 1 }).withMessage('Version must be a positive integer')
];

/**
 * @route   POST /api/sync/request
 * @desc    Request sync session between devices
 * @access  Public
 */
router.post('/request', validateSyncRequest, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { deviceId, data, priority = 'MEDIUM', compression = false } = req.body;

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      } as ApiResponse);
      return;
    }

    // Generate sync ID and checksum
    const syncId = crypto.randomUUID();
    const checksum = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

    // Create sync session
    const syncSession = await prisma.syncSession.create({
      data: {
        syncId,
        deviceId: device.id,
        priority,
        data,
        checksum,
        compression,
        status: 'PENDING'
      },
      include: {
        device: true
      }
    });

    // Log sync event
    await prisma.syncEvent.create({
      data: {
        syncId: syncSession.id,
        eventType: 'SYNC_START',
        deviceId: device.id,
        data: { syncId, priority }
      }
    });

    logger.info(`Sync session created: ${syncId} for device: ${deviceId}`);

    res.status(201).json({
      success: true,
      message: 'Sync session created successfully',
      data: {
        syncId: syncSession.syncId,
        status: syncSession.status,
        priority: syncSession.priority,
        checksum: syncSession.checksum,
        createdAt: syncSession.createdAt
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error creating sync session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/sync/sessions
 * @desc    Get all sync sessions
 * @access  Public
 */
router.get('/sessions', async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, status, priority, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (deviceId) {
      const device = await prisma.device.findUnique({ where: { deviceId: deviceId as string } });
      if (device) where.deviceId = device.id;
    }
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const [sessions, total] = await Promise.all([
      prisma.syncSession.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          device: {
            select: { deviceId: true, name: true, deviceType: true }
          },
          events: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      }),
      prisma.syncSession.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Sync sessions retrieved successfully',
      data: {
        sessions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving sync sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/sync/sessions/:syncId
 * @desc    Get sync session by ID
 * @access  Public
 */
router.get('/sessions/:syncId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { syncId } = req.params;

    if (!syncId) {
      res.status(400).json({
        success: false,
        message: 'Sync ID is required'
      } as ApiResponse);
      return;
    }

    const session = await prisma.syncSession.findUnique({
      where: { syncId },
      include: {
        device: {
          select: { deviceId: true, name: true, deviceType: true, status: true }
        },
        events: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Sync session not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Sync session retrieved successfully',
      data: session
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving sync session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   PUT /api/sync/sessions/:syncId/status
 * @desc    Update sync session status
 * @access  Public
 */
router.put('/sessions/:syncId/status', [
  body('status').isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED']).withMessage('Invalid status'),
  body('error').optional().isString().withMessage('Error must be a string')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { syncId } = req.params;
    const { status, error } = req.body;

    if (!syncId) {
      res.status(400).json({
        success: false,
        message: 'Sync ID is required'
      } as ApiResponse);
      return;
    }

    const session = await prisma.syncSession.findUnique({
      where: { syncId }
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Sync session not found'
      } as ApiResponse);
      return;
    }

    const updateData: any = { status };
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    const updatedSession = await prisma.syncSession.update({
      where: { syncId },
      data: updateData
    });

    // Log status change event
    await prisma.syncEvent.create({
      data: {
        syncId: session.id,
        eventType: status === 'COMPLETED' ? 'SYNC_COMPLETE' : status === 'FAILED' ? 'SYNC_ERROR' : 'STATE_UPDATE',
        deviceId: session.deviceId,
        data: { status, error },
        success: status !== 'FAILED',
        error: error || null
      }
    });

    logger.info(`Sync session ${syncId} status updated to: ${status}`);

    res.status(200).json({
      success: true,
      message: 'Sync session status updated successfully',
      data: updatedSession
    } as ApiResponse);

  } catch (error) {
    logger.error('Error updating sync session status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/sync/device-state
 * @desc    Update device state
 * @access  Public
 */
router.post('/device-state', validateDeviceState, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { deviceId, state, version } = req.body;

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      } as ApiResponse);
      return;
    }

    // Generate checksum for state
    const checksum = crypto.createHash('sha256').update(JSON.stringify(state)).digest('hex');

    // Update or create device state
    const deviceState = await prisma.deviceState.upsert({
      where: { deviceId: device.id },
      update: {
        state,
        version,
        checksum,
        lastSync: new Date()
      },
      create: {
        deviceId: device.id,
        state,
        version,
        checksum,
        lastSync: new Date()
      }
    });

    // Update device last seen
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeen: new Date() }
    });

    logger.info(`Device state updated for device: ${deviceId}, version: ${version}`);

    res.status(200).json({
      success: true,
      message: 'Device state updated successfully',
      data: {
        deviceId,
        version: deviceState.version,
        checksum: deviceState.checksum,
        lastSync: deviceState.lastSync
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error updating device state:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/sync/device-state/:deviceId
 * @desc    Get device state
 * @access  Public
 */
router.get('/device-state/:deviceId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      } as ApiResponse);
      return;
    }

    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: {
        deviceState: true
      }
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Device state retrieved successfully',
      data: {
        deviceId: device.deviceId,
        deviceType: device.deviceType,
        status: device.status,
        lastSeen: device.lastSeen,
        state: device.deviceState?.state || null,
        version: device.deviceState?.version || 0,
        checksum: device.deviceState?.checksum || null,
        lastSync: device.deviceState?.lastSync || null
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving device state:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/sync/events
 * @desc    Get sync events
 * @access  Public
 */
router.get('/events', async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, eventType, success, page = '1', limit = '50' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (deviceId) {
      const device = await prisma.device.findUnique({ where: { deviceId: deviceId as string } });
      if (device) where.deviceId = device.id;
    }
    if (eventType) where.eventType = eventType;
    if (success !== undefined) where.success = success === 'true';

    const [events, total] = await Promise.all([
      prisma.syncEvent.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { timestamp: 'desc' },
        include: {
          syncSession: {
            select: { syncId: true }
          }
        }
      }),
      prisma.syncEvent.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Sync events retrieved successfully',
      data: {
        events,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasNext: pageNum * limitNum < total,
          hasPrev: pageNum > 1
        }
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving sync events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/sync/conflict-resolve
 * @desc    Resolve sync conflicts
 * @access  Public
 */
router.post('/conflict-resolve', [
  body('syncId').notEmpty().withMessage('Sync ID is required'),
  body('resolution').isObject().withMessage('Resolution data is required'),
  body('strategy').isIn(['LAST_WRITE_WINS', 'MERGE', 'MANUAL']).withMessage('Invalid resolution strategy')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      } as ApiResponse);
      return;
    }

    const { syncId, resolution, strategy } = req.body;

    const session = await prisma.syncSession.findUnique({
      where: { syncId }
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Sync session not found'
      } as ApiResponse);
      return;
    }

    // Log conflict resolution event
    await prisma.syncEvent.create({
      data: {
        syncId: session.id,
        eventType: 'CONFLICT_RESOLVED',
        deviceId: session.deviceId,
        data: { resolution, strategy },
        success: true
      }
    });

    logger.info(`Sync conflict resolved for session: ${syncId} using strategy: ${strategy}`);

    res.status(200).json({
      success: true,
      message: 'Sync conflict resolved successfully',
      data: {
        syncId,
        strategy,
        resolution,
        resolvedAt: new Date()
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error resolving sync conflict:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/sync/device/register
 * @desc    Register a new device for sync
 * @access  Public
 */
router.post('/device/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, deviceType, capabilities, isPrimary = false } = req.body;

    if (!deviceId || !deviceType) {
      res.status(400).json({
        success: false,
        message: 'Device ID and device type are required'
      } as ApiResponse);
      return;
    }

    // Check if device already exists
    const existingDevice = await prisma.device.findUnique({
      where: { id: deviceId }
    });

    if (existingDevice) {
      // Update existing device
      const updatedDevice = await prisma.device.update({
        where: { id: deviceId },
        data: {
        deviceType,
        status: 'ONLINE',
          updatedAt: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Device updated successfully',
        data: { device: updatedDevice }
      } as ApiResponse);
      return;
    }

    // Create new device
    const newDevice = await prisma.device.create({
      data: {
        id: deviceId,
        deviceId: deviceId,
        deviceType,
        name: `${deviceType} Device`,
        location: 'Unknown',
        status: 'ONLINE',
        config: capabilities ? JSON.stringify(capabilities) : Prisma.JsonNull
      }
    });

    // Create initial device state
    await prisma.deviceState.create({
      data: {
        deviceId,
        state: JSON.stringify({
          isPrimary,
          capabilities,
          lastSync: new Date(),
          version: 1
        }),
        version: 1,
        checksum: crypto.createHash('md5').update(JSON.stringify({ isPrimary, capabilities })).digest('hex')
      }
    });

    res.status(201).json({
      success: true,
      message: 'Device registered successfully',
      data: { device: newDevice }
    } as ApiResponse);
  } catch (error) {
    logger.error('Device registration failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register device',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/sync/device/:deviceId/sync
 * @desc    Perform sync for specific device
 * @access  Public
 */
router.post('/device/:deviceId/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId } = req.params;

    if (!deviceId) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      } as ApiResponse);
      return;
    }

    // Verify device exists
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: {
        deviceState: true
      }
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      } as ApiResponse);
      return;
    }

    // Get latest slot data
    const slots = await prisma.slot.findMany({
      where: { isActive: true },
      include: {
        company: true,
        bids: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { slotNumber: 'asc' }
    });

    // Get system configuration
    const systemConfig = await prisma.systemConfig.findMany({
      where: { isActive: true }
    });

    // Get active auction sessions
    const activeAuctions = await prisma.auctionSession.findMany({
      where: { status: 'ACTIVE' },
      include: {
        slots: true
      }
    });

    // Prepare sync data
    const syncData = {
      timestamp: new Date(),
      deviceId,
      slots: slots.map(slot => ({
        id: slot.id,
        slotNumber: slot.slotNumber,
        status: slot.status,
        company: slot.company ? {
          id: slot.company.id,
          name: slot.company.name,
          logo: slot.company.logo,
          tier: slot.company.tier
        } : null,
        currentBid: slot.bids[0]?.amount || 0,
        reservePrice: slot.reservePrice,
        isActive: slot.isActive
      })),
      systemConfig: systemConfig.reduce((acc, config) => {
        acc[config.key] = config.value;
        return acc;
      }, {} as Record<string, any>),
      activeAuctions: activeAuctions.map(auction => ({
        id: auction.id,
        name: auction.name,
        status: auction.status,
        startTime: auction.startTime,
        endTime: auction.endTime,
        slots: auction.slots.map(slot => slot.id)
      })),
      systemHealth: {
        status: 'HEALTHY',
        lastCheck: new Date(),
        uptime: process.uptime()
      }
    };

    // Update device state
    const currentState = device.deviceState?.state ? JSON.parse(device.deviceState.state as string) : {};
    const newState = {
      ...currentState,
      lastSync: new Date(),
      version: (device.deviceState?.version || 0) + 1
    };

    await prisma.deviceState.upsert({
      where: { deviceId },
      update: {
        state: JSON.stringify(newState),
        version: newState.version,
        updatedAt: new Date()
      },
      create: {
        deviceId,
        state: JSON.stringify(newState),
        version: newState.version,
        checksum: crypto.createHash('md5').update(JSON.stringify(newState)).digest('hex')
      }
    });

    // Log sync event
    await prisma.syncEvent.create({
      data: {
        syncId: crypto.randomUUID(),
        deviceId,
        eventType: 'SYNC_START',
        data: JSON.stringify(syncData),
        // status: 'COMPLETED', // Field not available in SyncEvent model
        // priority: 'MEDIUM' // Field not available in SyncEvent model
      }
    });

    res.json({
      success: true,
      message: 'Device sync completed successfully',
      data: syncData
    } as ApiResponse);
  } catch (error) {
    logger.error('Device sync failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync device',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/sync/device/broadcast
 * @desc    Broadcast sync data to all devices
 * @access  Public
 */
router.post('/device/broadcast', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, priority = 'MEDIUM', targetDevices } = req.body;

    if (!data) {
      res.status(400).json({
        success: false,
        message: 'Broadcast data is required'
      } as ApiResponse);
      return;
    }

    // Get all active devices or specific target devices
    const devices = targetDevices 
      ? await prisma.device.findMany({
          where: { 
            id: { in: targetDevices },
            status: 'ONLINE' 
          }
        })
      : await prisma.device.findMany({
          where: { status: 'ONLINE' }
        });

    const broadcastId = crypto.randomUUID();
    const results = [];

    // Create sync events for each device
    for (const device of devices) {
      try {
        const syncEvent = await prisma.syncEvent.create({
          data: {
            syncId: broadcastId,
            deviceId: device.id,
            eventType: 'STATE_UPDATE',
            data: JSON.stringify(data),
            // status: 'PENDING', // Field not available in SyncEvent model
            // priority // Field not available in SyncEvent model
          }
        });

        results.push({
          deviceId: device.id,
          status: 'PENDING',
          syncEventId: syncEvent.id
        });
      } catch (error) {
        results.push({
          deviceId: device.id,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    res.json({
      success: true,
      message: 'Broadcast initiated successfully',
      data: {
        broadcastId,
        totalDevices: devices.length,
        results
      }
    } as ApiResponse);
  } catch (error) {
    logger.error('Device broadcast failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to broadcast to devices',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
});

export default router;
