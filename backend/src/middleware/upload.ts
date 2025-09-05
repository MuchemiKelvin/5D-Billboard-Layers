import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/sponsors',
    'uploads/slots',
    'uploads/ar-models',
    'uploads/holograms',
    'uploads/temp'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// File type validation
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'video/mp4': ['.mp4'],
    'video/webm': ['.webm'],
    'application/octet-stream': ['.glb', '.gltf', '.obj', '.fbx'], // 3D models
    'application/json': ['.json'] // AR configurations
  };

  const fileType = file.mimetype;
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedTypes[fileType as keyof typeof allowedTypes]?.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${fileType}${fileExt}`));
  }
};

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type and field name
    if (file.fieldname === 'logo' || file.fieldname === 'sponsorAsset') {
      uploadPath += 'sponsors/';
    } else if (file.fieldname === 'slotContent' || file.fieldname === 'slotAsset') {
      uploadPath += 'slots/';
    } else if (file.fieldname === 'arModel' || file.fieldname === 'arAsset') {
      uploadPath += 'ar-models/';
    } else if (file.fieldname === 'hologramAsset' || file.fieldname === 'hologramModel') {
      uploadPath += 'holograms/';
    } else {
      uploadPath += 'temp/';
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Image processing function
const processImage = async (inputPath: string, outputPath: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}) => {
  try {
    let processor = sharp(inputPath);

    if (options.width || options.height) {
      processor = processor.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    if (options.format === 'jpeg' || options.format === 'webp') {
      processor = processor[options.format]({ quality: options.quality || 80 });
    } else if (options.format === 'png') {
      processor = processor.png({ quality: options.quality || 80 });
    }

    await processor.toFile(outputPath);
    return true;
  } catch (error) {
    logger.error('Image processing error:', error);
    return false;
  }
};

// Main upload middleware
export const uploadSponsorAssets = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  }
});

export const uploadARContent = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for 3D models
    files: 3
  }
});

export const uploadSlotContent = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
    files: 3
  }
});

export const uploadHologramAssets = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for hologram models
    files: 2
  }
});

// Utility functions
export const deleteFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`Error deleting file ${filePath}:`, error);
    return false;
  }
};

export const getFileInfo = (filePath: string) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    }
    return { exists: false };
  } catch (error) {
    logger.error(`Error getting file info for ${filePath}:`, error);
    return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const createThumbnail = async (inputPath: string, outputPath: string, size: number = 300) => {
  return await processImage(inputPath, outputPath, {
    width: size,
    height: size,
    quality: 70,
    format: 'jpeg'
  });
};

export const optimizeImage = async (inputPath: string, outputPath: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}) => {
  return await processImage(inputPath, outputPath, options);
};

// Cleanup temporary files
export const cleanupTempFiles = () => {
  const tempDir = 'uploads/temp';
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
          logger.info(`Cleaned up old temp file: ${file}`);
        }
      });
    }
  } catch (error) {
    logger.error('Error cleaning up temp files:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupTempFiles, 60 * 60 * 1000);

export default {
  uploadSponsorAssets,
  uploadARContent,
  uploadSlotContent,
  uploadHologramAssets,
  deleteFile,
  getFileInfo,
  createThumbnail,
  optimizeImage,
  cleanupTempFiles
};
