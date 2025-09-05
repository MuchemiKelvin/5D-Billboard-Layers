import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const router = express.Router();

// Validation middleware
const validateDevice = [
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  body('deviceType').isIn(['BEAMER', 'IPAD', 'BILLBOARD', 'MOBILE']).withMessage('Invalid device type'),
  body('name').notEmpty().withMessage('Device name is required'),
  body('status').optional().isIn(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR']).withMessage('Invalid device status'),
  body('location').optional().isObject().withMessage('Location must be an object'),
  body('config').optional().isObject().withMessage('Config must be an object')
];

/**
 * @route   GET /api/devices
 * @desc    Get all devices
 * @access  Public
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceType, status, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (deviceType) where.deviceType = deviceType;
    if (status) where.status = status;

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.device.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Devices retrieved successfully',
      data: {
        devices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving devices:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve devices',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/devices/:id
 * @desc    Get device by ID
 * @access  Public
 */
router.get('/:id', [
  param('id').isString().withMessage('Invalid device ID')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
      return;
    }

    const device = await prisma.device.findUnique({
      where: { id }
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Device retrieved successfully',
      data: { device }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve device',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/devices/device-id/:deviceId
 * @desc    Get device by device ID
 * @access  Public
 */
router.get('/device-id/:deviceId', [
  param('deviceId').isString().withMessage('Invalid device ID')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { deviceId } = req.params;

    if (!deviceId) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
      return;
    }

    const device = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Device retrieved successfully',
      data: { device }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve device',
      error: (error as Error).message
    });
  }
});

/**
 * @route   POST /api/devices
 * @desc    Create new device
 * @access  Public (for testing)
 */
router.post('/', validateDevice, async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { deviceId, deviceType, name, status = 'OFFLINE', location, config } = req.body;

    // Check if device with this deviceId already exists
    const existingDevice = await prisma.device.findUnique({
      where: { deviceId }
    });

    if (existingDevice) {
      res.status(409).json({
        success: false,
        message: 'Device with this device ID already exists'
      });
      return;
    }

    const device = await prisma.device.create({
      data: {
        deviceId,
        deviceType,
        name,
        status,
        location: location || {},
        config: config || {}
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Device created successfully',
      data: { device }
    };

    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create device',
      error: (error as Error).message
    });
  }
});

/**
 * @route   PUT /api/devices/:id
 * @desc    Update device
 * @access  Public (for testing)
 */
router.put('/:id', [
  param('id').isString().withMessage('Invalid device ID'),
  ...validateDevice
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { deviceId, deviceType, name, status, location, config } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
      return;
    }

    // Check if device exists
    const existingDevice = await prisma.device.findUnique({
      where: { id }
    });

    if (!existingDevice) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    // Check if deviceId is being changed and if new deviceId already exists
    if (deviceId && deviceId !== existingDevice.deviceId) {
      const deviceWithNewId = await prisma.device.findUnique({
        where: { deviceId }
      });

      if (deviceWithNewId) {
        res.status(409).json({
          success: false,
          message: 'Device with this device ID already exists'
        });
        return;
      }
    }

    const device = await prisma.device.update({
      where: { id },
      data: {
        deviceId: deviceId || existingDevice.deviceId,
        deviceType: deviceType || existingDevice.deviceType,
        name: name || existingDevice.name,
        status: status || existingDevice.status,
        location: location !== undefined ? location : existingDevice.location,
        config: config !== undefined ? config : existingDevice.config
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Device updated successfully',
      data: { device }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device',
      error: (error as Error).message
    });
  }
});

/**
 * @route   DELETE /api/devices/:id
 * @desc    Delete device
 * @access  Public (for testing)
 */
router.delete('/:id', [
  param('id').isString().withMessage('Invalid device ID')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
      return;
    }

    // Check if device exists
    const existingDevice = await prisma.device.findUnique({
      where: { id }
    });

    if (!existingDevice) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    await prisma.device.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Device deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error deleting device:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete device',
      error: (error as Error).message
    });
  }
});

/**
 * @route   POST /api/devices/:id/heartbeat
 * @desc    Update device heartbeat (last seen)
 * @access  Public
 */
router.post('/:id/heartbeat', [
  param('id').isString().withMessage('Invalid device ID'),
  body('status').optional().isIn(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR']).withMessage('Invalid device status'),
  body('location').optional().isObject().withMessage('Location must be an object')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { status, location } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
      return;
    }

    // Check if device exists
    const existingDevice = await prisma.device.findUnique({
      where: { id }
    });

    if (!existingDevice) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    const updateData: any = {
      lastSeen: new Date()
    };

    if (status) updateData.status = status;
    if (location) updateData.location = location;

    const device = await prisma.device.update({
      where: { id },
      data: updateData
    });

    const response: ApiResponse = {
      success: true,
      message: 'Device heartbeat updated successfully',
      data: { device }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating device heartbeat:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device heartbeat',
      error: (error as Error).message
    });
  }
});

/**
 * @route   POST /api/devices/:id/status
 * @desc    Update device status
 * @access  Public
 */
router.post('/:id/status', [
  param('id').isString().withMessage('Invalid device ID'),
  body('status').isIn(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR']).withMessage('Invalid device status')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Device ID is required'
      });
      return;
    }

    // Check if device exists
    const existingDevice = await prisma.device.findUnique({
      where: { id }
    });

    if (!existingDevice) {
      res.status(404).json({
        success: false,
        message: 'Device not found'
      });
      return;
    }

    const device = await prisma.device.update({
      where: { id },
      data: { 
        status,
        lastSeen: new Date()
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Device status updated successfully',
      data: { device }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error updating device status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update device status',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/devices/type/:deviceType
 * @desc    Get devices by type
 * @access  Public
 */
router.get('/type/:deviceType', [
  param('deviceType').isIn(['BEAMER', 'IPAD', 'BILLBOARD', 'MOBILE']).withMessage('Invalid device type')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { deviceType } = req.params;
    const { status, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deviceType };
    if (status) where.status = status;

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.device.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: `Devices of type ${deviceType} retrieved successfully`,
      data: {
        devices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving devices by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve devices by type',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/devices/status/:status
 * @desc    Get devices by status
 * @access  Public
 */
router.get('/status/:status', [
  param('status').isIn(['ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR']).withMessage('Invalid device status')
], async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { status } = req.params;
    const { deviceType, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { status };
    if (deviceType) where.deviceType = deviceType;

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.device.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: `Devices with status ${status} retrieved successfully`,
      data: {
        devices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving devices by status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve devices by status',
      error: (error as Error).message
    });
  }
});

/**
 * @route   GET /api/devices/stats/overview
 * @desc    Get device statistics overview
 * @access  Public
 */
router.get('/stats/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalDevices,
      onlineDevices,
      offlineDevices,
      maintenanceDevices,
      errorDevices,
      beamerDevices,
      ipadDevices,
      billboardDevices,
      mobileDevices
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: 'ONLINE' } }),
      prisma.device.count({ where: { status: 'OFFLINE' } }),
      prisma.device.count({ where: { status: 'MAINTENANCE' } }),
      prisma.device.count({ where: { status: 'ERROR' } }),
      prisma.device.count({ where: { deviceType: 'BEAMER' } }),
      prisma.device.count({ where: { deviceType: 'IPAD' } }),
      prisma.device.count({ where: { deviceType: 'BILLBOARD' } }),
      prisma.device.count({ where: { deviceType: 'MOBILE' } })
    ]);

    const stats = {
      total: totalDevices,
      byStatus: {
        online: onlineDevices,
        offline: offlineDevices,
        maintenance: maintenanceDevices,
        error: errorDevices
      },
      byType: {
        beamer: beamerDevices,
        ipad: ipadDevices,
        billboard: billboardDevices,
        mobile: mobileDevices
      },
      onlinePercentage: totalDevices > 0 ? Math.round((onlineDevices / totalDevices) * 100) : 0
    };

    const response: ApiResponse = {
      success: true,
      message: 'Device statistics retrieved successfully',
      data: { stats }
    };

    res.status(200).json(response);
  } catch (error) {
    logger.error('Error retrieving device statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve device statistics',
      error: (error as Error).message
    });
  }
});

export default router;
