import express, { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { logger } from '../utils/logger';
import { prisma } from '../lib/database';
import { ApiResponse, Company, CompanyTier } from '../types';

const router = express.Router();

// Get all companies
router.get('/', [
  query('category').optional().isString(),
  query('tier').optional().isIn(['PREMIUM', 'STANDARD']),
  query('isActive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { category, tier, isActive, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {};
    if (category) where.category = category;
    if (tier) where.tier = tier;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              users: true,
              slots: true,
              bids: true
            }
          }
        }
      }),
      prisma.company.count({ where })
    ]);

    const response: ApiResponse = {
      success: true,
      message: 'Companies retrieved successfully',
      data: {
        companies,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    };

    return res.json(response);

  } catch (error) {
    logger.error('Companies retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Companies retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get company by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true,
            isActive: true,
            lastLogin: true
          }
        },
        slots: {
          select: {
            id: true,
            slotNumber: true,
            slotType: true,
            status: true,
            currentBid: true,
            startTime: true,
            endTime: true
          }
        },
        bids: {
          select: {
            id: true,
            amount: true,
            status: true,
            timestamp: true,
            slot: {
              select: {
                slotNumber: true
              }
            }
          },
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        _count: {
          select: {
            users: true,
            slots: true,
            bids: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Company retrieved successfully',
      data: company
    };

    return res.json(response);

  } catch (error) {
    logger.error('Company retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Company retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Create new company
router.post('/', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('category').trim().isLength({ min: 2, max: 50 }).withMessage('Category is required'),
  body('subcategory').trim().isLength({ min: 2, max: 50 }).withMessage('Subcategory is required'),
  body('tier').isIn(['PREMIUM', 'STANDARD']).withMessage('Valid tier is required'),
  body('industry').trim().isLength({ min: 2, max: 50 }).withMessage('Industry is required'),
  body('website').optional().isURL().withMessage('Valid website URL is required'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('founded').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
  body('headquarters').optional().isLength({ max: 100 }),
  body('employeeCount').optional().isLength({ max: 50 }),
  body('revenue').optional().isLength({ max: 50 }),
  body('maxBidAmount').optional().isFloat({ min: 0 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      category,
      subcategory,
      tier,
      industry,
      website,
      description,
      founded,
      headquarters,
      employeeCount,
      revenue,
      maxBidAmount = 0
    } = req.body;

    // Check if company already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name }
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: 'Company with this name already exists'
      });
    }

    const company = await prisma.company.create({
      data: {
        name,
        category,
        subcategory,
        tier,
        industry,
        website,
        description,
        founded,
        headquarters,
        employeeCount,
        revenue,
        maxBidAmount,
        auctionEligible: true,
        isActive: true
      }
    });

    logger.info(`New company created: ${name} (${tier})`);

    const response: ApiResponse = {
      success: true,
      message: 'Company created successfully',
      data: company
    };

    return res.status(201).json(response);

  } catch (error) {
    logger.error('Company creation failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Company creation failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Update company
router.put('/:id', [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('category').optional().trim().isLength({ min: 2, max: 50 }),
  body('subcategory').optional().trim().isLength({ min: 2, max: 50 }),
  body('tier').optional().isIn(['PREMIUM', 'STANDARD']),
  body('industry').optional().trim().isLength({ min: 2, max: 50 }),
  body('website').optional().isURL(),
  body('description').optional().isLength({ max: 500 }),
  body('founded').optional().isInt({ min: 1800, max: new Date().getFullYear() }),
  body('headquarters').optional().isLength({ max: 100 }),
  body('employeeCount').optional().isLength({ max: 50 }),
  body('revenue').optional().isLength({ max: 50 }),
  body('maxBidAmount').optional().isFloat({ min: 0 }),
  body('auctionEligible').optional().isBoolean(),
  body('isActive').optional().isBoolean()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    // Check if company exists
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if name is being changed and if it conflicts
    if (updateData.name && updateData.name !== existingCompany.name) {
      const nameConflict = await prisma.company.findFirst({
        where: { 
          name: updateData.name,
          id: { not: id }
        }
      });

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: 'Company with this name already exists'
        });
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: updateData
    });

    logger.info(`Company updated: ${company.name}`);

    const response: ApiResponse = {
      success: true,
      message: 'Company updated successfully',
      data: company
    };

    return res.json(response);

  } catch (error) {
    logger.error('Company update failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Company update failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Delete company
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    // Check if company exists
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            slots: true,
            bids: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if company has associated data
    if (company._count.users > 0 || company._count.slots > 0 || company._count.bids > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete company with associated users, slots, or bids. Deactivate instead.'
      });
    }

    await prisma.company.delete({
      where: { id }
    });

    logger.info(`Company deleted: ${company.name}`);

    const response: ApiResponse = {
      success: true,
      message: 'Company deleted successfully'
    };

    return res.json(response);

  } catch (error) {
    logger.error('Company deletion failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Company deletion failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get companies by category
router.get('/category/:category', async (req: Request, res: Response) => {
  try {
    const { category } = req.params;
    const { tier, isActive } = req.query;

    const where: any = { category };
    if (tier) where.tier = tier;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            slots: true,
            bids: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Companies in category '${category}' retrieved successfully`,
      data: companies
    };

    return res.json(response);

  } catch (error) {
    logger.error('Companies by category retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Companies by category retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get companies by tier
router.get('/tier/:tier', async (req: Request, res: Response) => {
  try {
    const { tier } = req.params;
    const { category, isActive } = req.query;

    if (!tier || !['PREMIUM', 'STANDARD'].includes(tier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier. Must be PREMIUM or STANDARD'
      });
    }

    const where: any = { tier };
    if (category) where.category = category;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            slots: true,
            bids: true
          }
        }
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Companies with tier '${tier}' retrieved successfully`,
      data: companies
    };

    return res.json(response);

  } catch (error) {
    logger.error('Companies by tier retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Companies by tier retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get company statistics
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            slots: true,
            bids: true
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get additional statistics
    const [totalBidAmount, activeSlots, wonBids] = await Promise.all([
      prisma.bid.aggregate({
        where: { companyId: id },
        _sum: { amount: true }
      }),
      prisma.slot.count({
        where: { 
          currentSponsor: id,
          status: { in: ['OCCUPIED', 'AUCTION_ACTIVE'] }
        }
      }),
      prisma.bid.count({
        where: { 
          companyId: id,
          status: 'WON'
        }
      })
    ]);

    const stats = {
      company: {
        id: company.id,
        name: company.name,
        tier: company.tier
      },
      counts: {
        users: company._count.users,
        slots: company._count.slots,
        bids: company._count.bids,
        activeSlots,
        wonBids
      },
      financial: {
        totalBidAmount: totalBidAmount._sum?.amount || 0,
        maxBidAmount: company.maxBidAmount
      }
    };

    const response: ApiResponse = {
      success: true,
      message: 'Company statistics retrieved successfully',
      data: stats
    };

    return res.json(response);

  } catch (error) {
    logger.error('Company statistics retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Company statistics retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

export default router;
