import { Router } from 'express';
import { prisma } from '../lib/database';

const router = Router();

// Get AR models
router.get('/models', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [models, total] = await Promise.all([
      prisma.visualEffect.findMany({
        where: {
          type: 'HOLOGRAM'
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.visualEffect.count({
        where: {
          type: 'HOLOGRAM'
        }
      })
    ]);

    // Transform models for AR-specific response
    const arModels = models.map(model => ({
      id: model.id,
      name: model.name,
      type: model.type,
      description: model.description,
      config: model.config,
      isActive: model.isActive,
      isDefault: model.isDefault,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      arProperties: {
        supportedFormats: ['GLB', 'GLTF', 'OBJ', 'FBX'],
        maxFileSize: '50MB',
        supportedAnimations: ['idle', 'hover', 'click', 'rotate'],
        lighting: 'dynamic',
        shadows: true,
        reflections: true
      }
    }));

    return res.json({
      success: true,
      message: 'AR models retrieved successfully',
      data: {
        models: arModels,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching AR models:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch AR models',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get AR triggers
router.get('/triggers', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [triggers, total] = await Promise.all([
      prisma.hologramConfig.findMany({
        skip,
        take: Number(limit),
        include: {
          effect: true,
          slot: {
            include: {
              company: true
            }
          },
          company: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.hologramConfig.count()
    ]);

    // Transform triggers for AR-specific response
    const arTriggers = triggers.map(trigger => ({
      id: trigger.id,
      name: trigger.name,
      config: trigger.config,
      isActive: trigger.isActive,
      createdAt: trigger.createdAt,
      updatedAt: trigger.updatedAt,
      effect: trigger.effect,
      slot: trigger.slot ? {
        id: trigger.slot.id,
        slotNumber: trigger.slot.slotNumber,
        status: trigger.slot.status,
        company: trigger.slot.company
      } : null,
      company: trigger.company,
      triggerProperties: {
        triggerType: 'proximity',
        activationDistance: 2.0, // meters
        cooldownPeriod: 5000, // milliseconds
        maxActivations: 100,
        supportedDevices: ['mobile', 'tablet', 'ar-glasses'],
        trackingMode: 'world',
        occlusionHandling: true
      }
    }));

    return res.json({
      success: true,
      message: 'AR triggers retrieved successfully',
      data: {
        triggers: arTriggers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching AR triggers:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch AR triggers',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
