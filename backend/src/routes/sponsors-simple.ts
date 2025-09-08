import { Router } from 'express';
import { prisma } from '../lib/database';

const router = Router();

// Get all sponsors (alias for companies)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [sponsors, total] = await Promise.all([
      prisma.company.findMany({
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' }
      }),
      prisma.company.count()
    ]);

    return res.json({
      success: true,
      message: 'Sponsors retrieved successfully',
      data: {
        sponsors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsors',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get sponsor by ID (alias for companies)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sponsor = await prisma.company.findUnique({
      where: { id }
    });

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    return res.json({
      success: true,
      message: 'Sponsor retrieved successfully',
      data: { sponsor }
    });
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
