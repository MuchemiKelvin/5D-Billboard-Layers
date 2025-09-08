import { Router } from 'express';
import { prisma } from '../lib/database';

const router = Router();

// Get all blocks (scheduling blocks)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [blocks, total] = await Promise.all([
      prisma.scheduleBlock.findMany({
        skip,
        take: Number(limit),
        include: {
          schedule: true
        },
        orderBy: { startTime: 'asc' }
      }),
      prisma.scheduleBlock.count()
    ]);

    return res.json({
      success: true,
      message: 'Blocks retrieved successfully',
      data: {
        blocks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching blocks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch blocks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get active block
router.get('/active', async (req, res) => {
  try {
    const now = new Date();

    const activeBlock = await prisma.scheduleBlock.findFirst({
      where: {
        startTime: {
          lte: now
        },
        endTime: {
          gte: now
        }
      },
      include: {
        schedule: true
      },
      orderBy: { startTime: 'desc' }
    });

    return res.json({
      success: true,
      message: 'Active block retrieved successfully',
      data: { block: activeBlock }
    });
  } catch (error) {
    console.error('Error fetching active block:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch active block',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
