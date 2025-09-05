import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { prisma } from '../lib/database';
import { 
  uploadSponsorAssets, 
  uploadARContent, 
  uploadSlotContent, 
  uploadHologramAssets,
  deleteFile,
  getFileInfo,
  createThumbnail
} from '../middleware/upload';

const router = express.Router();

// Upload sponsor assets (logos, images)
router.post('/sponsors/:companyId', uploadSponsorAssets.array('assets', 5), async (req: Request, res: Response) => {
  try {
    const { companyId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Verify company exists
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      // Clean up uploaded files
      files.forEach(file => deleteFile(file.path));
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Process uploaded files
    const uploadedFiles = [];
    for (const file of files) {
      try {
        // Create thumbnail for images
        if (file.mimetype.startsWith('image/')) {
          const thumbnailPath = file.path.replace(/\.[^/.]+$/, '_thumb.jpg');
          await createThumbnail(file.path, thumbnailPath);
        }

        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/api/uploads/uploads/sponsors/${file.filename}`,
          thumbnailUrl: file.mimetype.startsWith('image/') ? `/api/uploads/uploads/sponsors/${file.filename.replace(/\.[^/.]+$/, '_thumb.jpg')}` : null
        });
      } catch (error) {
        logger.error(`Error processing file ${file.originalname}:`, error);
        deleteFile(file.path);
      }
    }

    logger.info(`Uploaded ${uploadedFiles.length} files for company ${companyId}`);

    return res.status(201).json({
      success: true,
      message: 'Files uploaded successfully',
      data: {
        companyId,
        files: uploadedFiles,
        totalFiles: uploadedFiles.length
      }
    });

  } catch (error) {
    logger.error('Sponsor asset upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload AR content (3D models, configurations)
router.post('/ar-content', uploadARContent.array('arAssets', 3), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = [];
    for (const file of files) {
      try {
        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/api/uploads/uploads/ar-models/${file.filename}`
        });
      } catch (error) {
        logger.error(`Error processing AR file ${file.originalname}:`, error);
        deleteFile(file.path);
      }
    }

    logger.info(`Uploaded ${uploadedFiles.length} AR content files`);

    return res.status(201).json({
      success: true,
      message: 'AR content uploaded successfully',
      data: {
        files: uploadedFiles,
        totalFiles: uploadedFiles.length
      }
    });

  } catch (error) {
    logger.error('AR content upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload AR content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload slot content
router.post('/slots/:slotId', uploadSlotContent.array('slotAssets', 3), async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Verify slot exists
    if (!slotId) {
      return res.status(400).json({
        success: false,
        message: 'Slot ID is required'
      });
    }

    const slot = await prisma.slot.findUnique({
      where: { id: slotId }
    });

    if (!slot) {
      files.forEach(file => deleteFile(file.path));
      return res.status(404).json({
        success: false,
        message: 'Slot not found'
      });
    }

    const uploadedFiles = [];
    for (const file of files) {
      try {
        // Create thumbnail for images
        if (file.mimetype.startsWith('image/')) {
          const thumbnailPath = file.path.replace(/\.[^/.]+$/, '_thumb.jpg');
          await createThumbnail(file.path, thumbnailPath);
        }

        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/api/uploads/uploads/slots/${file.filename}`,
          thumbnailUrl: file.mimetype.startsWith('image/') ? `/api/uploads/uploads/slots/${file.filename.replace(/\.[^/.]+$/, '_thumb.jpg')}` : null
        });
      } catch (error) {
        logger.error(`Error processing slot file ${file.originalname}:`, error);
        deleteFile(file.path);
      }
    }

    logger.info(`Uploaded ${uploadedFiles.length} files for slot ${slotId}`);

    return res.status(201).json({
      success: true,
      message: 'Slot content uploaded successfully',
      data: {
        slotId,
        files: uploadedFiles,
        totalFiles: uploadedFiles.length
      }
    });

  } catch (error) {
    logger.error('Slot content upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload slot content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload hologram assets
router.post('/holograms', uploadHologramAssets.array('hologramAssets', 2), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = [];
    for (const file of files) {
      try {
        uploadedFiles.push({
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/api/uploads/uploads/holograms/${file.filename}`
        });
      } catch (error) {
        logger.error(`Error processing hologram file ${file.originalname}:`, error);
        deleteFile(file.path);
      }
    }

    logger.info(`Uploaded ${uploadedFiles.length} hologram asset files`);

    return res.status(201).json({
      success: true,
      message: 'Hologram assets uploaded successfully',
      data: {
        files: uploadedFiles,
        totalFiles: uploadedFiles.length
      }
    });

  } catch (error) {
    logger.error('Hologram asset upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload hologram assets',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve uploaded files
router.get('/uploads/:type/:filename', (req: Request, res: Response) => {
  try {
    const { type, filename } = req.params;
    
    if (!type || !filename) {
      return res.status(400).json({
        success: false,
        message: 'Type and filename are required'
      });
    }

    const filePath = path.join('uploads', type, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    logger.error('Serve file error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to serve file',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// List uploaded files (simple version without database)
router.get('/files', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    const uploadDir = type ? `uploads/${type}` : 'uploads';
    
    if (!fs.existsSync(uploadDir)) {
      return res.json({
        success: true,
        message: 'No files found',
        data: {
          files: [],
          totalFiles: 0
        }
      });
    }

    const files = fs.readdirSync(uploadDir, { withFileTypes: true })
      .filter(dirent => dirent.isFile())
      .map(dirent => {
        const filePath = path.join(uploadDir, dirent.name);
        const stats = fs.statSync(filePath);
        
        return {
          filename: dirent.name,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/api/uploads/uploads/${type}/${dirent.name}`
        };
      });

    return res.json({
      success: true,
      message: 'Files retrieved successfully',
      data: {
        files,
        totalFiles: files.length
      }
    });

  } catch (error) {
    logger.error('List files error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to list files',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
