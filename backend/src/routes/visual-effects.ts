import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// VISUAL EFFECTS MANAGEMENT
// ============================================================================

// Get all visual effects
router.get('/effects', async (req, res) => {
  try {
    const { 
      type, 
      isActive, 
      isDefault,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (type) where.type = type as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (isDefault !== undefined) where.isDefault = isDefault === 'true';

    const [effects, total] = await Promise.all([
      prisma.visualEffect.findMany({
        where,
        include: {
          hologramConfigs: true,
          animationPresets: true,
          slotEffects: {
            include: {
              slot: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.visualEffect.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Visual effects retrieved successfully',
      data: {
        effects,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching visual effects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visual effects',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get visual effect by ID
router.get('/effects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const effect = await prisma.visualEffect.findUnique({
      where: { id },
      include: {
        hologramConfigs: {
          include: {
            slot: true,
            company: true
          }
        },
        animationPresets: true,
        slotEffects: {
          include: {
            slot: true
          }
        }
      }
    });

    if (!effect) {
      return res.status(404).json({
        success: false,
        message: 'Visual effect not found'
      });
    }

    return res.json({
      success: true,
      message: 'Visual effect retrieved successfully',
      data: { effect }
    });
  } catch (error) {
    console.error('Error fetching visual effect:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch visual effect',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create visual effect
const createEffectSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    'HOLOGRAM', 'PARTICLE_SYSTEM', 'LIGHTING', 'ANIMATION',
    'TRANSITION', 'OVERLAY', 'BACKGROUND', 'INTERACTION'
  ]),
  description: z.string().optional(),
  config: z.any(), // JSON object
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false)
});

router.post('/effects', async (req, res) => {
  try {
    const validatedData = createEffectSchema.parse(req.body);

    const effect = await prisma.visualEffect.create({
      data: {
        ...validatedData,
        description: validatedData.description || null
      },
      include: {
        hologramConfigs: true,
        animationPresets: true,
        slotEffects: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Visual effect created successfully',
      data: { effect }
    });
  } catch (error) {
    console.error('Error creating visual effect:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create visual effect',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update visual effect
const updateEffectSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum([
    'HOLOGRAM', 'PARTICLE_SYSTEM', 'LIGHTING', 'ANIMATION',
    'TRANSITION', 'OVERLAY', 'BACKGROUND', 'INTERACTION'
  ]).optional(),
  description: z.string().optional(),
  config: z.any().optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional()
});

router.put('/effects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateEffectSchema.parse(req.body);

    const effect = await prisma.visualEffect.update({
      where: { id },
      data: validatedData as any,
      include: {
        hologramConfigs: true,
        animationPresets: true,
        slotEffects: true
      }
    });

    res.json({
      success: true,
      message: 'Visual effect updated successfully',
      data: { effect }
    });
  } catch (error) {
    console.error('Error updating visual effect:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update visual effect',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete visual effect
router.delete('/effects/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.visualEffect.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Visual effect deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting visual effect:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete visual effect',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// HOLOGRAM CONFIGURATIONS
// ============================================================================

// Get hologram configurations
router.get('/holograms', async (req, res) => {
  try {
    const { 
      effectId, 
      slotId, 
      companyId, 
      isActive,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (effectId) where.effectId = effectId as string;
    if (slotId) where.slotId = slotId as string;
    if (companyId) where.companyId = companyId as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [holograms, total] = await Promise.all([
      prisma.hologramConfig.findMany({
        where,
        include: {
          effect: true,
          slot: true,
          company: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.hologramConfig.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Hologram configurations retrieved successfully',
      data: {
        holograms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching hologram configurations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hologram configurations',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create hologram configuration
const createHologramSchema = z.object({
  effectId: z.string(),
  slotId: z.string().optional(),
  companyId: z.string().optional(),
  name: z.string().min(1),
  config: z.any(), // JSON object
  isActive: z.boolean().default(true)
});

router.post('/holograms', async (req, res) => {
  try {
    const validatedData = createHologramSchema.parse(req.body);

    const hologram = await prisma.hologramConfig.create({
      data: {
        ...validatedData,
        slotId: validatedData.slotId || null,
        companyId: validatedData.companyId || null
      },
      include: {
        effect: true,
        slot: true,
        company: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Hologram configuration created successfully',
      data: { hologram }
    });
  } catch (error) {
    console.error('Error creating hologram configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create hologram configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// ANIMATION PRESETS
// ============================================================================

// Get animation presets
router.get('/animations', async (req, res) => {
  try {
    const { 
      effectId, 
      isActive,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (effectId) where.effectId = effectId as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [animations, total] = await Promise.all([
      prisma.animationPreset.findMany({
        where,
        include: {
          effect: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.animationPreset.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Animation presets retrieved successfully',
      data: {
        animations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching animation presets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch animation presets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create animation preset
const createAnimationSchema = z.object({
  effectId: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  config: z.any(), // JSON object
  duration: z.number().default(5000),
  isActive: z.boolean().default(true)
});

router.post('/animations', async (req, res) => {
  try {
    const validatedData = createAnimationSchema.parse(req.body);

    const animation = await prisma.animationPreset.create({
      data: {
        ...validatedData,
        description: validatedData.description || null
      },
      include: {
        effect: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Animation preset created successfully',
      data: { animation }
    });
  } catch (error) {
    console.error('Error creating animation preset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create animation preset',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// SLOT VISUAL EFFECTS
// ============================================================================

// Get slot visual effects
router.get('/slots/:slotId/effects', async (req, res) => {
  try {
    const { slotId } = req.params;
    const { isActive } = req.query;

    const where: any = { slotId };
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const slotEffects = await prisma.slotVisualEffect.findMany({
      where,
      include: {
        effect: true,
        slot: true
      },
      orderBy: { priority: 'desc' }
    });

    res.json({
      success: true,
      message: 'Slot visual effects retrieved successfully',
      data: { slotEffects }
    });
  } catch (error) {
    console.error('Error fetching slot visual effects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch slot visual effects',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Assign effect to slot
const assignEffectSchema = z.object({
  effectId: z.string(),
  isActive: z.boolean().default(true),
  priority: z.number().default(1),
  config: z.any().optional() // Slot-specific overrides
});

router.post('/slots/:slotId/effects', async (req, res) => {
  try {
    const { slotId } = req.params;
    const validatedData = assignEffectSchema.parse(req.body);

    const slotEffect = await prisma.slotVisualEffect.create({
      data: {
        ...validatedData,
        slotId
      },
      include: {
        effect: true,
        slot: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Effect assigned to slot successfully',
      data: { slotEffect }
    });
  } catch (error) {
    console.error('Error assigning effect to slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign effect to slot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update slot effect
router.put('/slots/:slotId/effects/:effectId', async (req, res) => {
  try {
    const { slotId, effectId } = req.params;
    const updateData = req.body;

    const slotEffect = await prisma.slotVisualEffect.update({
      where: {
        slotId_effectId: {
          slotId,
          effectId
        }
      },
      data: updateData,
      include: {
        effect: true,
        slot: true
      }
    });

    res.json({
      success: true,
      message: 'Slot effect updated successfully',
      data: { slotEffect }
    });
  } catch (error) {
    console.error('Error updating slot effect:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update slot effect',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Remove effect from slot
router.delete('/slots/:slotId/effects/:effectId', async (req, res) => {
  try {
    const { slotId, effectId } = req.params;

    await prisma.slotVisualEffect.delete({
      where: {
        slotId_effectId: {
          slotId,
          effectId
        }
      }
    });

    res.json({
      success: true,
      message: 'Effect removed from slot successfully'
    });
  } catch (error) {
    console.error('Error removing effect from slot:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove effect from slot',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// EFFECT TEMPLATES
// ============================================================================

// Get effect templates
router.get('/templates', async (req, res) => {
  try {
    const { 
      category, 
      isPublic,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (category) where.category = category as string;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const [templates, total] = await Promise.all([
      prisma.effectTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.effectTemplate.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Effect templates retrieved successfully',
      data: {
        templates,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching effect templates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch effect templates',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create effect template
const createTemplateSchema = z.object({
  name: z.string().min(1),
  category: z.enum([
    'SPONSOR_DISPLAY', 'AUCTION_EFFECTS', 'INTERACTIVE_ELEMENTS',
    'BACKGROUND_AMBIENCE', 'TRANSITION_EFFECTS', 'SPECIAL_EVENTS'
  ]),
  description: z.string().optional(),
  template: z.any(), // Complete effect template JSON
  isPublic: z.boolean().default(false),
  createdBy: z.string().optional()
});

router.post('/templates', async (req, res) => {
  try {
    const validatedData = createTemplateSchema.parse(req.body);

    const template = await prisma.effectTemplate.create({
      data: {
        ...validatedData,
        description: validatedData.description || null,
        createdBy: validatedData.createdBy || null
      }
    });

    res.status(201).json({
      success: true,
      message: 'Effect template created successfully',
      data: { template }
    });
  } catch (error) {
    console.error('Error creating effect template:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create effect template',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// EFFECT PERFORMANCE MONITORING
// ============================================================================

// Get effect performance data
router.get('/performance', async (req, res) => {
  try {
    const { 
      effectId, 
      slotId, 
      deviceId,
      startDate, 
      endDate,
      page = 1, 
      limit = 50 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (effectId) where.effectId = effectId as string;
    if (slotId) where.slotId = slotId as string;
    if (deviceId) where.deviceId = deviceId as string;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [performance, total] = await Promise.all([
      prisma.effectPerformance.findMany({
        where,
        include: {
          effect: true,
          slot: true,
          device: true
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.effectPerformance.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Effect performance data retrieved successfully',
      data: {
        performance,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching effect performance data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch effect performance data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Record effect performance
const recordPerformanceSchema = z.object({
  effectId: z.string(),
  slotId: z.string().optional(),
  deviceId: z.string().optional(),
  renderTime: z.number(),
  frameRate: z.number(),
  memoryUsage: z.number(),
  cpuUsage: z.number()
});

router.post('/performance', async (req, res) => {
  try {
    const validatedData = recordPerformanceSchema.parse(req.body);

    const performance = await prisma.effectPerformance.create({
      data: {
        ...validatedData,
        timestamp: new Date(),
        slotId: validatedData.slotId || null,
        deviceId: validatedData.deviceId || null
      },
      include: {
        effect: true,
        slot: true,
        device: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Effect performance recorded successfully',
      data: { performance }
    });
  } catch (error) {
    console.error('Error recording effect performance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record effect performance',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// VISUAL EFFECTS DASHBOARD
// ============================================================================

// Get visual effects dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const { period = '24h' } = req.query;
    
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '1h':
        startDate.setHours(endDate.getHours() - 1);
        break;
      case '24h':
        startDate.setDate(endDate.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
    }

    // Get effect statistics
    const [totalEffects, activeEffects, defaultEffects] = await Promise.all([
      prisma.visualEffect.count(),
      prisma.visualEffect.count({ where: { isActive: true } }),
      prisma.visualEffect.count({ where: { isDefault: true } })
    ]);

    // Get effect type distribution
    const effectTypes = await prisma.visualEffect.groupBy({
      by: ['type'],
      _count: { type: true }
    });

    // Get recent performance data
    const recentPerformance = await prisma.effectPerformance.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        effect: true
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    // Calculate performance averages
    const performanceStats = recentPerformance.reduce((acc: any, perf) => {
      if (!acc[perf.effectId]) {
        acc[perf.effectId] = {
          effectName: perf.effect.name,
          renderTimes: [],
          frameRates: [],
          memoryUsage: [],
          cpuUsage: []
        };
      }
      
      acc[perf.effectId].renderTimes.push(perf.renderTime);
      acc[perf.effectId].frameRates.push(perf.frameRate);
      acc[perf.effectId].memoryUsage.push(perf.memoryUsage);
      acc[perf.effectId].cpuUsage.push(perf.cpuUsage);
      
      return acc;
    }, {});

    // Calculate averages
    Object.keys(performanceStats).forEach(effectId => {
      const stats = performanceStats[effectId];
      stats.averageRenderTime = stats.renderTimes.reduce((a: number, b: number) => a + b, 0) / stats.renderTimes.length;
      stats.averageFrameRate = stats.frameRates.reduce((a: number, b: number) => a + b, 0) / stats.frameRates.length;
      stats.averageMemoryUsage = stats.memoryUsage.reduce((a: number, b: number) => a + b, 0) / stats.memoryUsage.length;
      stats.averageCpuUsage = stats.cpuUsage.reduce((a: number, b: number) => a + b, 0) / stats.cpuUsage.length;
    });

    res.json({
      success: true,
      message: 'Visual effects dashboard data retrieved successfully',
      data: {
        dashboard: {
          timestamp: new Date(),
          period,
          summary: {
            totalEffects,
            activeEffects,
            defaultEffects
          },
          effectTypes: effectTypes.reduce((acc: any, type) => {
            acc[type.type] = type._count.type;
            return acc;
          }, {}),
          performanceStats,
          recentPerformance: recentPerformance.slice(0, 10)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching visual effects dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch visual effects dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
