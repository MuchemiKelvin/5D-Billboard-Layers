const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/logger');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/sponsors',
    'uploads/slots',
    'uploads/ar-models',
    'uploads/holograms'
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // Determine upload path based on file type or field name
    if (file.fieldname === 'staticLogo' || file.fieldname === 'logo') {
      uploadPath += 'sponsors/';
    } else if (file.fieldname === 'hologramVideo') {
      uploadPath += 'holograms/';
    } else if (file.fieldname === 'arModel') {
      uploadPath += 'ar-models/';
    } else if (file.fieldname === 'slotContent') {
      uploadPath += 'slots/';
    } else {
      uploadPath += 'general/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
  const allowedModelTypes = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
  
  // Check file type based on field name
  if (file.fieldname === 'staticLogo' || file.fieldname === 'logo') {
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for logos'), false);
    }
  } else if (file.fieldname === 'hologramVideo') {
    if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for holograms'), false);
    }
  } else if (file.fieldname === 'arModel') {
    if (allowedModelTypes.includes(file.mimetype) || file.originalname.endsWith('.gltf') || file.originalname.endsWith('.glb') || file.originalname.endsWith('.fbx')) {
      cb(null, true);
    } else {
      cb(new Error('Only GLTF, GLB, or FBX files are allowed for AR models'), false);
    }
  } else {
    // Allow other file types
    cb(null, true);
  }
};

// Create multer instance for sponsor assets
const uploadSponsorAssets = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 3 // Max 3 files
  }
});

// Create multer instance for slot content
const uploadSlotContent = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 5 // Max 5 files
  }
});

// Create multer instance for AR models
const uploadARModels = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB
    files: 1 // Max 1 file
  }
});

// Image processing middleware
const processImage = async (req, res, next) => {
  try {
    if (!req.files) return next();

    const imageFields = ['staticLogo', 'logo', 'slotImage'];
    const processedFiles = [];

    for (const field of imageFields) {
      if (req.files[field]) {
        const files = Array.isArray(req.files[field]) ? req.files[field] : [req.files[field]];
        
        for (const file of files) {
          if (file.mimetype.startsWith('image/')) {
            const outputPath = file.path.replace(path.extname(file.path), '_processed.jpg');
            
            await sharp(file.path)
              .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 85, progressive: true })
              .toFile(outputPath);
            
            // Replace original with processed version
            fs.unlinkSync(file.path);
            file.path = outputPath;
            file.filename = path.basename(outputPath);
            
            processedFiles.push({
              field: field,
              originalName: file.originalname,
              filename: file.filename,
              path: file.path,
              size: file.size
            });
          }
        }
      }
    }

    if (processedFiles.length > 0) {
      logger.info(`🖼️ Processed ${processedFiles.length} images`);
    }

    next();
  } catch (error) {
    logger.error('❌ Image processing failed:', error);
    next(error);
  }
};

// Video processing middleware
const processVideo = async (req, res, next) => {
  try {
    if (!req.files) return next();

    const videoFields = ['hologramVideo', 'slotVideo'];
    const processedFiles = [];

    for (const field of videoFields) {
      if (req.files[field]) {
        const files = Array.isArray(req.files[field]) ? req.files[field] : [req.files[field]];
        
        for (const file of files) {
          if (file.mimetype.startsWith('video/')) {
            // For now, just log video files
            // In production, you might want to use ffmpeg for video processing
            processedFiles.push({
              field: field,
              originalName: file.originalname,
              filename: file.filename,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype
            });
          }
        }
      }
    }

    if (processedFiles.length > 0) {
      logger.info(`🎥 Processed ${processedFiles.length} videos`);
    }

    next();
  } catch (error) {
    logger.error('❌ Video processing failed:', error);
    next(error);
  }
};

// File cleanup middleware
const cleanupFiles = async (req, res, next) => {
  try {
    // Clean up temporary files after processing
    if (req.files) {
      const allFiles = Object.values(req.files).flat();
      
      // Log file information
      allFiles.forEach(file => {
        logger.info(`📁 File uploaded: ${file.originalname} -> ${file.filename} (${file.size} bytes)`);
      });
    }

    next();
  } catch (error) {
    logger.error('❌ File cleanup failed:', error);
    next(error);
  }
};

// File validation middleware
const validateFiles = (req, res, next) => {
  try {
    if (!req.files) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const requiredFields = req.body.requiredFields ? req.body.requiredFields.split(',') : [];
    const uploadedFields = Object.keys(req.files);
    
    // Check if all required fields have files
    for (const field of requiredFields) {
      if (!uploadedFields.includes(field) || !req.files[field].length) {
        return res.status(400).json({
          success: false,
          message: `Required field '${field}' is missing or empty`
        });
      }
    }

    next();
  } catch (error) {
    logger.error('❌ File validation failed:', error);
    next(error);
  }
};

// File size validation middleware
const validateFileSizes = (maxSize = 50 * 1024 * 1024) => {
  return (req, res, next) => {
    try {
      if (!req.files) return next();

      const allFiles = Object.values(req.files).flat();
      
      for (const file of allFiles) {
        if (file.size > maxSize) {
          return res.status(400).json({
            success: false,
            message: `File ${file.originalname} is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB`
          });
        }
      }

      next();
    } catch (error) {
      logger.error('❌ File size validation failed:', error);
      next(error);
    }
  };
};

module.exports = {
  uploadSponsorAssets,
  uploadSlotContent,
  uploadARModels,
  processImage,
  processVideo,
  cleanupFiles,
  validateFiles,
  validateFileSizes
};
