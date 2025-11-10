const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose');
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createBanner,
  getActiveBanners,
  getAllBanners,
  getBannerImage,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');

const router = express.Router();

let storage;
let upload;

// Initialize GridFS storage when MongoDB is connected
const initializeStorage = () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected. ReadyState:', mongoose.connection.readyState);
      return false;
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      console.error('Database not available from mongoose connection');
      return false;
    }
    
    storage = new GridFsStorage({
      db: db,
      file: (_req, file) => {
        return {
          bucketName: 'banners',
          filename: `${Date.now()}-${file.originalname}`,
          metadata: { originalname: file.originalname },
        };
      },
    });
    
    upload = multer({ 
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    });
    
    console.log('GridFS storage initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing GridFS storage:', error);
    return false;
  }
};

// Initialize on connection
const tryInitialize = () => {
  if (mongoose.connection.readyState === 1) {
    initializeStorage();
  } else {
    mongoose.connection.once('connected', () => {
      console.log('MongoDB connected, initializing GridFS storage...');
      initializeStorage();
    });
  }
};

tryInitialize();

router.get('/active', getActiveBanners);
router.get('/all', protect, admin, getAllBanners);
router.get('/:id/image', getBannerImage);
router.post('/', protect, admin, (req, res, next) => {
  if (!upload) {
    console.error('Upload middleware not initialized. MongoDB readyState:', mongoose.connection.readyState);
    // Try to initialize again
    if (initializeStorage() && upload) {
      return upload.single('image')(req, res, next);
    }
    return res.status(503).json({ 
      message: 'File storage not initialized. Please wait for database connection.',
      details: process.env.NODE_ENV === 'development' ? `MongoDB readyState: ${mongoose.connection.readyState}` : undefined
    });
  }
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }
    next();
  });
}, createBanner);
router.patch('/:id', protect, admin, updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;


