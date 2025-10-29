import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { prisma } from '../lib/database';
import { UserRole, JWTPayload, ApiResponse } from '../types';

const router = express.Router();

// Helper function to get permissions by role
const getPermissionsByRole = (role: string): string[] => {
  switch (role.toLowerCase()) {
    case 'admin':
      return ['read', 'write', 'admin', 'delete'];
    case 'operator':
      return ['read', 'write'];
    case 'sponsor':
      return ['read', 'bid'];
    case 'viewer':
    default:
      return ['read'];
  }
};

// User registration
router.post('/register', [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['ADMIN', 'OPERATOR', 'SPONSOR', 'VIEWER', 'NOTARY', 'AUDITOR']).withMessage('Valid role is required'),
  body('companyId').optional().isString().withMessage('Company ID must be a string')
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

    const { username, email, password, role = 'VIEWER', companyId } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role.toUpperCase() as UserRole,
        permissions: JSON.stringify(getPermissionsByRole(role)),
        isActive: true
      }
    });

    logger.info(`New user registered: ${username} (${role})`);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role 
      } as JWTPayload,
      process.env.JWT_SECRET || 'beamershow-secret-key',
      { expiresIn: '24h' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    };

    return res.status(201).json(response);

  } catch (error) {
    logger.error('User registration failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Registration failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// User login
router.post('/login', [
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('username').optional().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { username, email, password } = req.body;

    // Find user by username or email
    const whereConditions: any[] = [];
    if (username) whereConditions.push({ username: username });
    if (email) whereConditions.push({ email: email });
    
    if (whereConditions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is required'
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: whereConditions,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: JSON.parse(user.permissions || '[]')
      } as JWTPayload,
      process.env.JWT_SECRET || 'beamershow-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${username}`);

    // Return user info and token
    const { password: _, ...userWithoutPassword } = user;
    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    };

    return res.json(response);

  } catch (error) {
    logger.error('Login failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Login failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get user profile
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key') as JWTPayload;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        companyId: true,
        permissions: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    };

    return res.json(response);

  } catch (error) {
    logger.error('Profile retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Profile retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Update user profile
router.put('/profile', [
  body('username').optional().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required')
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

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key') as JWTPayload;
    const { username, email } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        ...(username && { username }),
        ...(email && { email })
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        companyId: true,
        permissions: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    };

    return res.json(response);

  } catch (error) {
    logger.error('Profile update failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Profile update failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Change password
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key') as JWTPayload;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedNewPassword }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    return res.json(response);

  } catch (error) {
    logger.error('Password change failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Password change failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key') as JWTPayload;
    
    // Generate new token
    const newToken = jwt.sign(
      {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        permissions: decoded.permissions
      } as JWTPayload,
      process.env.JWT_SECRET || 'beamershow-secret-key',
      { expiresIn: '24h' }
    );

    const response: ApiResponse = {
      success: true,
      message: 'Token refreshed successfully',
      data: { token: newToken }
    };

    return res.json(response);

  } catch (error) {
    logger.error('Token refresh failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Token refresh failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };

    return res.json(response);

  } catch (error) {
    logger.error('Logout failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Logout failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

// Get all users (admin only)
router.get('/users', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beamershow-secret-key') as JWTPayload;
    
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        companyId: true,
        permissions: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: users
    };

    return res.json(response);

  } catch (error) {
    logger.error('Users retrieval failed:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Users retrieval failed',
      error: (error as Error).message
    };
    return res.status(500).json(response);
  }
});

export default router;
