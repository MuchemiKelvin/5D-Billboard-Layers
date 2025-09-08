import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { prisma } from '../lib/database';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types';

const router = express.Router();

// Validation middleware
const validateSystemConfig = [
  body('key').notEmpty().withMessage('Configuration key is required'),
  body('value').notEmpty().withMessage('Configuration value is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('category').optional().isString().withMessage('Category must be a string')
];

/**
 * @route   POST /api/system-config
 * @desc    Create or update system configuration
 * @access  Public
 */
router.post('/', validateSystemConfig, async (req: Request, res: Response): Promise<void> => {
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

    const { key, value, description, category = 'general' } = req.body;

    // Upsert configuration
    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: {
        value,
        description,
        category,
        isActive: true
      },
      create: {
        key,
        value,
        description,
        category,
        isActive: true
      }
    });

    logger.info(`System configuration updated: ${key}`);

    res.status(200).json({
      success: true,
      message: 'System configuration updated successfully',
      data: config
    } as ApiResponse);

  } catch (error) {
    logger.error('Error updating system configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/system-config
 * @desc    Get system configurations
 * @access  Public
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, isActive, page = '1', limit = '50' } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [configs, total] = await Promise.all([
      prisma.systemConfig.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { key: 'asc' }
      }),
      prisma.systemConfig.count({ where })
    ]);

    res.status(200).json({
      success: true,
      message: 'System configurations retrieved successfully',
      data: {
        configs,
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
    logger.error('Error retrieving system configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/system-config/:key
 * @desc    Get system configuration by key
 * @access  Public
 */
router.get('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    if (!key) {
      res.status(400).json({
        success: false,
        message: 'Configuration key is required'
      } as ApiResponse);
      return;
    }

    const config = await prisma.systemConfig.findUnique({
      where: { key }
    });

    if (!config) {
      res.status(404).json({
        success: false,
        message: 'Configuration not found'
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'System configuration retrieved successfully',
      data: config
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving system configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   PUT /api/system-config/:key
 * @desc    Update system configuration
 * @access  Public
 */
router.put('/:key', [
  body('value').notEmpty().withMessage('Configuration value is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('category').optional().isString().withMessage('Category must be a string'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean')
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

    const { key } = req.params;
    const { value, description, category, isActive } = req.body;

    if (!key) {
      res.status(400).json({
        success: false,
        message: 'Configuration key is required'
      } as ApiResponse);
      return;
    }

    const config = await prisma.systemConfig.update({
      where: { key },
      data: {
        value,
        description,
        category,
        isActive
      }
    });

    logger.info(`System configuration updated: ${key}`);

    res.status(200).json({
      success: true,
      message: 'System configuration updated successfully',
      data: config
    } as ApiResponse);

  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Configuration not found'
      } as ApiResponse);
      return;
    }
    logger.error('Error updating system configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   DELETE /api/system-config/:key
 * @desc    Delete system configuration
 * @access  Public
 */
router.delete('/:key', async (req: Request, res: Response): Promise<void> => {
  try {
    const { key } = req.params;

    if (!key) {
      res.status(400).json({
        success: false,
        message: 'Configuration key is required'
      } as ApiResponse);
      return;
    }

    await prisma.systemConfig.delete({
      where: { key }
    });

    logger.info(`System configuration deleted: ${key}`);

    res.status(200).json({
      success: true,
      message: 'System configuration deleted successfully'
    } as ApiResponse);

  } catch (error: any) {
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Configuration not found'
      } as ApiResponse);
      return;
    }
    logger.error('Error deleting system configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/system-config/category/:category
 * @desc    Get configurations by category
 * @access  Public
 */
router.get('/category/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    if (!category) {
      res.status(400).json({
        success: false,
        message: 'Category is required'
      } as ApiResponse);
      return;
    }

    const configs = await prisma.systemConfig.findMany({
      where: { 
        category,
        isActive: true
      },
      orderBy: { key: 'asc' }
    });

    res.status(200).json({
      success: true,
      message: `Configurations for category '${category}' retrieved successfully`,
      data: configs
    } as ApiResponse);

  } catch (error) {
    logger.error('Error retrieving configurations by category:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/system-config/bulk
 * @desc    Bulk update system configurations
 * @access  Public
 */
router.post('/bulk', [
  body('configs').isArray().withMessage('Configs must be an array'),
  body('configs.*.key').notEmpty().withMessage('Each config must have a key'),
  body('configs.*.value').notEmpty().withMessage('Each config must have a value')
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

    const { configs } = req.body;

    // Update configurations in transaction
    const results = await prisma.$transaction(
      configs.map((config: any) =>
        prisma.systemConfig.upsert({
          where: { key: config.key },
          update: {
            value: config.value,
            description: config.description,
            category: config.category || 'general',
            isActive: config.isActive !== undefined ? config.isActive : true
          },
          create: {
            key: config.key,
            value: config.value,
            description: config.description,
            category: config.category || 'general',
            isActive: config.isActive !== undefined ? config.isActive : true
          }
        })
      )
    );

    logger.info(`Bulk updated ${results.length} system configurations`);

    res.status(200).json({
      success: true,
      message: 'System configurations updated successfully',
      data: {
        updated: results.length,
        configs: results
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error bulk updating system configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   GET /api/system-config/export
 * @desc    Export all system configurations
 * @access  Public
 */
router.get('/export', async (req: Request, res: Response): Promise<void> => {
  try {
    const configs = await prisma.systemConfig.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    });

    // Group by category
    const groupedConfigs = configs.reduce((acc: any, config) => {
      if (!acc[config.category]) {
        acc[config.category] = [];
      }
      acc[config.category].push({
        key: config.key,
        value: config.value,
        description: config.description
      });
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      message: 'System configurations exported successfully',
      data: {
        exportedAt: new Date(),
        totalConfigs: configs.length,
        categories: Object.keys(groupedConfigs),
        configs: groupedConfigs
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error exporting system configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

/**
 * @route   POST /api/system-config/import
 * @desc    Import system configurations
 * @access  Public
 */
router.post('/import', [
  body('configs').isObject().withMessage('Configs must be an object'),
  body('overwrite').optional().isBoolean().withMessage('Overwrite must be boolean')
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

    const { configs, overwrite = false } = req.body;

    let imported = 0;
    let skipped = 0;

    // Process each category
    for (const [category, categoryConfigs] of Object.entries(configs)) {
      for (const config of categoryConfigs as any[]) {
        try {
          if (overwrite) {
            await prisma.systemConfig.upsert({
              where: { key: config.key },
              update: {
                value: config.value,
                description: config.description,
                category
              },
              create: {
                key: config.key,
                value: config.value,
                description: config.description,
                category
              }
            });
            imported++;
          } else {
            const existing = await prisma.systemConfig.findUnique({
              where: { key: config.key }
            });
            if (!existing) {
              await prisma.systemConfig.create({
                data: {
                  key: config.key,
                  value: config.value,
                  description: config.description,
                  category
                }
              });
              imported++;
            } else {
              skipped++;
            }
          }
        } catch (error) {
          logger.error(`Error importing config ${config.key}:`, error);
          skipped++;
        }
      }
    }

    logger.info(`Imported ${imported} configurations, skipped ${skipped}`);

    res.status(200).json({
      success: true,
      message: 'System configurations imported successfully',
      data: {
        imported,
        skipped,
        total: imported + skipped
      }
    } as ApiResponse);

  } catch (error) {
    logger.error('Error importing system configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    } as ApiResponse);
  }
});

export default router;
