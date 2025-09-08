import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const router = express.Router();

// Validation middleware
const validateSchedule = [
  body('name').notEmpty().withMessage('Schedule name is required'),
  body('type').isIn(['ROTATION', 'MAINTENANCE', 'SPECIAL_EVENT', 'AUCTION', 'CUSTOM']).withMessage('Invalid schedule type'),
  body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime').optional().isISO8601().withMessage('End time must be a valid ISO 8601 date'),
  body('config').isObject().withMessage('Schedule configuration is required'),
  body('recurrence').optional().isObject().withMessage('Recurrence must be an object')
];

const validateScheduleBlock = [
  body('scheduleId').notEmpty().withMessage('Schedule ID is required'),
  body('name').notEmpty().withMessage('Block name is required'),
  body('startTime').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime').isISO8601().withMessage('End time must be a valid ISO 8601 date'),
  body('slots').isObject().withMessage('Slots configuration is required'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
];

/**
 * @route   POST /api/scheduling/schedules
 * @desc    Create a new schedule
 * @access  Public
 */
router.post('/schedules', validateSchedule, async (req: Request, res: Response): Promise<void> => {
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

    const { name, description, type, startTime, endTime, recurrence, config } = req.body;

    const schedule = await prisma.schedule.create({
      data: {
        name,
        description,
        type,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        recurrence,
        config,
        status: 'ACTIVE'
      }
    });

    logger.info(`Schedule created: ${schedule.id} - ${name}`);

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully',
      data: schedule
    } as ApiResponse);

  } catch (error) {
    logger.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/scheduling/schedules
 * @desc    Get all schedules
 * @access  Public
 */
router.get('/schedules', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, status, isActive, page = '1', limit = '20' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          blocks: {
            orderBy: { order: 'asc' }
          }
        }
      }),
      prisma.schedule.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'Schedules retrieved successfully',
      data: {
        schedules,
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
    logger.error('Error retrieving schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/scheduling/schedules/:id
 * @desc    Get schedule by ID
 * @access  Public
 */
router.get('/schedules/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Schedule ID is required'
      } as ApiResponse);
      return;
    }

    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        blocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Schedule not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Schedule retrieved successfully',
      data: schedule
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   PUT /api/scheduling/schedules/:id
 * @desc    Update schedule
 * @access  Public
 */
router.put('/schedules/:id', [
  body('name').optional().notEmpty().withMessage('Schedule name cannot be empty'),
  body('type').optional().isIn(['ROTATION', 'MAINTENANCE', 'SPECIAL_EVENT', 'AUCTION', 'CUSTOM']).withMessage('Invalid schedule type'),
  body('status').optional().isIn(['ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid schedule status'),
  body('startTime').optional().isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
  body('endTime').optional().isISO8601().withMessage('End time must be a valid ISO 8601 date')
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

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Schedule ID is required'
      } as ApiResponse);
      return;
    }

    // Convert date strings to Date objects
    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);

    const schedule = await prisma.schedule.update({
      where: { id },
      data: updateData,
      include: {
        blocks: {
          orderBy: { order: 'asc' }
        }
      }
    });

    logger.info(`Schedule updated: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Schedule updated successfully',
      data: schedule
    } as ApiResponse);

  } catch (error) {
    logger.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   DELETE /api/scheduling/schedules/:id
 * @desc    Delete schedule
 * @access  Public
 */
router.delete('/schedules/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Schedule ID is required'
      } as ApiResponse);
      return;
    }

    // Delete schedule blocks first
    await prisma.scheduleBlock.deleteMany({
      where: { scheduleId: id }
    });

    // Delete schedule
    await prisma.schedule.delete({
      where: { id }
    });

    logger.info(`Schedule deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: 'Schedule deleted successfully'
    } as ApiResponse);

  } catch (error) {
    logger.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/scheduling/schedules/:id/blocks
 * @desc    Add block to schedule
 * @access  Public
 */
router.post('/schedules/:id/blocks', validateScheduleBlock, async (req: Request, res: Response): Promise<void> => {
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

    const { id } = req.params;
    const { name, startTime, endTime, slots, order = 0 } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Schedule ID is required'
      } as ApiResponse);
      return;
    }

    // Verify schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id }
    });

    if (!schedule) {
      res.status(404).json({
        success: false,
        message: 'Schedule not found'
      } as ApiResponse);
      return;
    }

    const block = await prisma.scheduleBlock.create({
      data: {
        scheduleId: id,
        name,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        slots,
        order
      }
    });

    logger.info(`Schedule block created: ${block.id} for schedule: ${id}`);

    res.status(201).json({
      success: true,
      message: 'Schedule block created successfully',
      data: block
    } as ApiResponse);

  } catch (error) {
    logger.error('Error creating schedule block:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/scheduling/active
 * @desc    Get currently active schedule
 * @access  Public
 */
router.get('/active', async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    const activeSchedule = await prisma.schedule.findFirst({
      where: {
        status: 'ACTIVE',
        isActive: true,
        startTime: { lte: now },
        OR: [
          { endTime: null },
          { endTime: { gte: now } }
        ]
      },
      include: {
        blocks: {
          where: {
            isActive: true,
            startTime: { lte: now },
            endTime: { gte: now }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { startTime: 'desc' }
    });

    if (!activeSchedule) {
      res.status(404).json({
        success: false,
        message: 'No active schedule found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Active schedule retrieved successfully',
      data: activeSchedule
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving active schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/scheduling/rotation/start
 * @desc    Start rotation schedule
 * @access  Public
 */
router.post('/rotation/start', [
  body('rotationSpeed').isInt({ min: 1, max: 3600 }).withMessage('Rotation speed must be between 1 and 3600 seconds'),
  body('cyclesPerDay').isInt({ min: 1, max: 1440 }).withMessage('Cycles per day must be between 1 and 1440'),
  body('autoRotation').isBoolean().withMessage('Auto rotation must be boolean')
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

    const { rotationSpeed, cyclesPerDay, autoRotation } = req.body;

    // Create rotation schedule
    const schedule = await prisma.schedule.create({
      data: {
        name: 'Auto Rotation Schedule',
        description: 'Automated 24-slot rotation schedule',
        type: 'ROTATION',
        startTime: new Date(),
        config: {
          rotationSpeed,
          cyclesPerDay,
          autoRotation,
          currentCycle: 0,
          totalCycles: 0
        },
        status: 'ACTIVE'
      }
    });

    // Create rotation blocks (24 slots)
    const blocks = [];
    for (let i = 0; i < 24; i++) {
      const block = await prisma.scheduleBlock.create({
        data: {
          scheduleId: schedule.id,
          name: `Slot ${i + 1} Block`,
          startTime: new Date(),
          endTime: new Date(Date.now() + rotationSpeed * 1000),
          slots: { slotNumber: i + 1, duration: rotationSpeed },
          order: i
        }
      });
      blocks.push(block);
    }

    logger.info(`Rotation schedule started: ${schedule.id} with ${blocks.length} blocks`);

    res.status(201).json({
      success: true,
      message: 'Rotation schedule started successfully',
      data: {
        schedule,
        blocks
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error starting rotation schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/scheduling/rotation/pause
 * @desc    Pause rotation schedule
 * @access  Public
 */
router.post('/rotation/pause', async (req: Request, res: Response): Promise<void> => {
  try {
    // Find active rotation schedule
    const activeSchedule = await prisma.schedule.findFirst({
      where: {
        type: 'ROTATION',
        status: 'ACTIVE'
      }
    });

    if (!activeSchedule) {
      res.status(404).json({
        success: false,
        message: 'No active rotation schedule found'
      } as ApiResponse);
      return;
    }

    // Pause the schedule
    const updatedSchedule = await prisma.schedule.update({
      where: { id: activeSchedule.id },
      data: { status: 'PAUSED' }
    });

    logger.info(`Rotation schedule paused: ${activeSchedule.id}`);

    res.status(200).json({
      success: true,
      message: 'Rotation schedule paused successfully',
      data: updatedSchedule
    } as ApiResponse);

  } catch (error) {
    logger.error('Error pausing rotation schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/scheduling/rotation/resume
 * @desc    Resume rotation schedule
 * @access  Public
 */
router.post('/rotation/resume', async (req: Request, res: Response): Promise<void> => {
  try {
    // Find paused rotation schedule
    const pausedSchedule = await prisma.schedule.findFirst({
      where: {
        type: 'ROTATION',
        status: 'PAUSED'
      }
    });

    if (!pausedSchedule) {
      res.status(404).json({
        success: false,
        message: 'No paused rotation schedule found'
      } as ApiResponse);
      return;
    }

    // Resume the schedule
    const updatedSchedule = await prisma.schedule.update({
      where: { id: pausedSchedule.id },
      data: { status: 'ACTIVE' }
    });

    logger.info(`Rotation schedule resumed: ${pausedSchedule.id}`);

    res.status(200).json({
      success: true,
      message: 'Rotation schedule resumed successfully',
      data: updatedSchedule
    } as ApiResponse);

  } catch (error) {
    logger.error('Error resuming rotation schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
