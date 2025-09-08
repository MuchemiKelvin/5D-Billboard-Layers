import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

// Get all performance metrics with filtering
router.get('/metrics', async (req, res) => {
  try {
    const { 
      deviceId, 
      slotId, 
      metricType, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (deviceId) where.deviceId = deviceId as string;
    if (slotId) where.slotId = slotId as string;
    if (metricType) where.metricType = metricType as string;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [metrics, total] = await Promise.all([
      prisma.performanceMetric.findMany({
        where,
        include: {
          device: true,
          slot: true
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.performanceMetric.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: {
        metrics,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create performance metric
const createMetricSchema = z.object({
  metricType: z.enum([
    'CPU_USAGE', 'MEMORY_USAGE', 'DISK_USAGE', 'NETWORK_LATENCY',
    'RESPONSE_TIME', 'THROUGHPUT', 'ERROR_RATE', 'AVAILABILITY',
    'SLOT_LOAD_TIME', 'DEVICE_TEMPERATURE', 'POWER_CONSUMPTION'
  ]),
  value: z.number(),
  unit: z.string().optional(),
  deviceId: z.string().optional(),
  slotId: z.string().optional(),
  metadata: z.string().optional()
});

router.post('/metrics', async (req, res) => {
  try {
    const validatedData = createMetricSchema.parse(req.body);

    const metric = await prisma.performanceMetric.create({
      data: {
        ...validatedData,
        timestamp: new Date(),
        deviceId: validatedData.deviceId || null,
        slotId: validatedData.slotId || null,
        metadata: validatedData.metadata || null,
        unit: validatedData.unit || null
      },
      include: {
        device: true,
        slot: true
      }
    });

    // Check for threshold alerts
    await checkMetricThresholds(metric);

    res.status(201).json({
      success: true,
      message: 'Performance metric created successfully',
      data: { metric }
    });
  } catch (error) {
    console.error('Error creating performance metric:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create performance metric',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get performance metrics summary
router.get('/metrics/summary', async (req, res) => {
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
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
    }

    const metrics = await prisma.performanceMetric.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Group metrics by type and calculate averages
    const summary = metrics.reduce((acc: any, metric) => {
      if (!acc[metric.metricType]) {
        acc[metric.metricType] = {
          count: 0,
          total: 0,
          min: metric.value,
          max: metric.value,
          unit: metric.unit
        };
      }
      
      acc[metric.metricType].count++;
      acc[metric.metricType].total += metric.value;
      acc[metric.metricType].min = Math.min(acc[metric.metricType].min, metric.value);
      acc[metric.metricType].max = Math.max(acc[metric.metricType].max, metric.value);
      
      return acc;
    }, {});

    // Calculate averages
    Object.keys(summary).forEach(type => {
      summary[type].average = summary[type].total / summary[type].count;
    });

    res.json({
      success: true,
      message: 'Performance metrics summary retrieved successfully',
      data: {
        period,
        dateRange: { start: startDate, end: endDate },
        summary
      }
    });
  } catch (error) {
    console.error('Error fetching performance metrics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics summary',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// SYSTEM HEALTH
// ============================================================================

// Get current system health
router.get('/health', async (req, res) => {
  try {
    const health = await prisma.systemHealth.findFirst({
      orderBy: { lastCheck: 'desc' }
    });

    if (!health) {
      // Create initial health record if none exists
      const newHealth = await prisma.systemHealth.create({
        data: {
          status: 'HEALTHY',
          overallScore: 100,
          activeDevices: 0,
          totalDevices: 0,
          errorCount: 0,
          warningCount: 0
        }
      });
      
      return res.json({
        success: true,
        message: 'System health retrieved successfully',
        data: { health: newHealth }
      });
    }

    return res.json({
      success: true,
      message: 'System health retrieved successfully',
      data: { health }
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch system health',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update system health
const updateHealthSchema = z.object({
  status: z.enum(['HEALTHY', 'WARNING', 'CRITICAL', 'OFFLINE']).optional(),
  overallScore: z.number().min(0).max(100).optional(),
  cpuUsage: z.number().optional(),
  memoryUsage: z.number().optional(),
  diskUsage: z.number().optional(),
  networkLatency: z.number().optional(),
  activeDevices: z.number().optional(),
  totalDevices: z.number().optional(),
  errorCount: z.number().optional(),
  warningCount: z.number().optional()
});

router.post('/health', async (req, res) => {
  try {
    const validatedData = updateHealthSchema.parse(req.body);

    const health = await prisma.systemHealth.create({
      data: {
        status: validatedData.status || 'HEALTHY',
        overallScore: validatedData.overallScore || 100,
        cpuUsage: validatedData.cpuUsage || null,
        memoryUsage: validatedData.memoryUsage || null,
        diskUsage: validatedData.diskUsage || null,
        networkLatency: validatedData.networkLatency || null,
        activeDevices: validatedData.activeDevices || 0,
        totalDevices: validatedData.totalDevices || 0,
        errorCount: validatedData.errorCount || 0,
        warningCount: validatedData.warningCount || 0,
        lastCheck: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'System health updated successfully',
      data: { health }
    });
  } catch (error) {
    console.error('Error updating system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update system health',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// PERFORMANCE ALERTS
// ============================================================================

// Get all performance alerts
router.get('/alerts', async (req, res) => {
  try {
    const { 
      severity, 
      alertType, 
      isResolved, 
      deviceId, 
      slotId,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (severity) where.severity = severity as string;
    if (alertType) where.alertType = alertType as string;
    if (isResolved !== undefined) where.isResolved = isResolved === 'true';
    if (deviceId) where.deviceId = deviceId as string;
    if (slotId) where.slotId = slotId as string;

    const [alerts, total] = await Promise.all([
      prisma.performanceAlert.findMany({
        where,
        include: {
          device: true,
          slot: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.performanceAlert.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Performance alerts retrieved successfully',
      data: {
        alerts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching performance alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance alerts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create performance alert
const createAlertSchema = z.object({
  alertType: z.enum([
    'THRESHOLD_EXCEEDED', 'DEVICE_OFFLINE', 'HIGH_ERROR_RATE',
    'PERFORMANCE_DEGRADATION', 'RESOURCE_EXHAUSTION', 'SYSTEM_OVERLOAD',
    'NETWORK_ISSUE', 'STORAGE_FULL'
  ]),
  severity: z.enum(['INFO', 'WARNING', 'ERROR', 'CRITICAL']),
  title: z.string(),
  message: z.string(),
  metricType: z.string().optional(),
  threshold: z.number().optional(),
  currentValue: z.number().optional(),
  deviceId: z.string().optional(),
  slotId: z.string().optional(),
  metadata: z.string().optional()
});

router.post('/alerts', async (req, res) => {
  try {
    const validatedData = createAlertSchema.parse(req.body);

    const alert = await prisma.performanceAlert.create({
      data: {
        ...validatedData,
        deviceId: validatedData.deviceId || null,
        slotId: validatedData.slotId || null,
        metadata: validatedData.metadata || null,
        metricType: validatedData.metricType as any || null,
        threshold: validatedData.threshold || null,
        currentValue: validatedData.currentValue || null
      },
      include: {
        device: true,
        slot: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Performance alert created successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Error creating performance alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create performance alert',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Resolve performance alert
router.patch('/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolvedBy } = req.body;

    const alert = await prisma.performanceAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: resolvedBy || 'system'
      },
      include: {
        device: true,
        slot: true
      }
    });

    res.json({
      success: true,
      message: 'Performance alert resolved successfully',
      data: { alert }
    });
  } catch (error) {
    console.error('Error resolving performance alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve performance alert',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// RESOURCE USAGE
// ============================================================================

// Get resource usage data
router.get('/resources', async (req, res) => {
  try {
    const { 
      deviceId, 
      resourceType, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (deviceId) where.deviceId = deviceId as string;
    if (resourceType) where.resourceType = resourceType as string;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate as string);
      if (endDate) where.timestamp.lte = new Date(endDate as string);
    }

    const [resources, total] = await Promise.all([
      prisma.resourceUsage.findMany({
        where,
        include: {
          device: true
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.resourceUsage.count({ where })
    ]);

    res.json({
      success: true,
      message: 'Resource usage data retrieved successfully',
      data: {
        resources,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching resource usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resource usage data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create resource usage record
const createResourceSchema = z.object({
  deviceId: z.string().optional(),
  resourceType: z.enum(['CPU', 'MEMORY', 'DISK', 'NETWORK', 'STORAGE', 'POWER', 'TEMPERATURE']),
  usage: z.number(),
  capacity: z.number().optional(),
  unit: z.string().optional()
});

router.post('/resources', async (req, res) => {
  try {
    const validatedData = createResourceSchema.parse(req.body);

    const resource = await prisma.resourceUsage.create({
      data: {
        ...validatedData,
        timestamp: new Date(),
        deviceId: validatedData.deviceId || null,
        capacity: validatedData.capacity || null,
        unit: validatedData.unit || null
      },
      include: {
        device: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Resource usage record created successfully',
      data: { resource }
    });
  } catch (error) {
    console.error('Error creating resource usage record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create resource usage record',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// PERFORMANCE DASHBOARD
// ============================================================================

// Get performance dashboard data
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

    // Get system health
    const health = await prisma.systemHealth.findFirst({
      orderBy: { lastCheck: 'desc' }
    });

    // Get active alerts
    const activeAlerts = await prisma.performanceAlert.count({
      where: { isResolved: false }
    });

    // Get recent metrics
    const recentMetrics = await prisma.performanceMetric.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    // Get device statistics
    const deviceStats = await prisma.device.groupBy({
      by: ['status'],
      _count: { status: true }
    });

    // Calculate performance trends
    const trends = calculatePerformanceTrends(recentMetrics);

    res.json({
      success: true,
      message: 'Performance dashboard data retrieved successfully',
      data: {
        dashboard: {
          timestamp: new Date(),
          period,
          systemHealth: health,
          activeAlerts,
          deviceStats: deviceStats.reduce((acc: any, stat) => {
            acc[stat.status] = stat._count.status;
            return acc;
          }, {}),
          trends,
          recentMetrics: recentMetrics.slice(0, 10)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching performance dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance dashboard data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function checkMetricThresholds(metric: any) {
  const thresholds = {
    CPU_USAGE: 80,
    MEMORY_USAGE: 85,
    DISK_USAGE: 90,
    NETWORK_LATENCY: 1000,
    ERROR_RATE: 5,
    DEVICE_TEMPERATURE: 80
  };

  const threshold = thresholds[metric.metricType as keyof typeof thresholds];
  if (threshold && metric.value > threshold) {
    await prisma.performanceAlert.create({
      data: {
        alertType: 'THRESHOLD_EXCEEDED',
        severity: metric.value > threshold * 1.5 ? 'CRITICAL' : 'WARNING',
        title: `${metric.metricType} threshold exceeded`,
        message: `${metric.metricType} is at ${metric.value}${metric.unit || ''}, exceeding threshold of ${threshold}${metric.unit || ''}`,
        metricType: metric.metricType,
        threshold,
        currentValue: metric.value,
        deviceId: metric.deviceId,
        slotId: metric.slotId
      }
    });
  }
}

function calculatePerformanceTrends(metrics: any[]) {
  const trends: any = {};
  
  // Group by metric type
  const grouped = metrics.reduce((acc: any, metric) => {
    if (!acc[metric.metricType]) acc[metric.metricType] = [];
    acc[metric.metricType].push(metric);
    return acc;
  }, {});

  // Calculate trends for each metric type
  Object.keys(grouped).forEach(type => {
    const typeMetrics = grouped[type].sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    if (typeMetrics.length >= 2) {
      const first = typeMetrics[0].value;
      const last = typeMetrics[typeMetrics.length - 1].value;
      const change = ((last - first) / first) * 100;
      
      trends[type] = {
        current: last,
        change: Number(change.toFixed(2)),
        trend: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable'
      };
    }
  });

  return trends;
}

export default router;
