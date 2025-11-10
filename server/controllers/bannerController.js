const mongoose = require('mongoose');
const Banner = require('../models/Banner');
const { getBucket } = require('../utils/gridfs');

const createBanner = async (req, res) => {
  try {
    console.log('Creating banner, req.file:', req.file ? { id: req.file.id, filename: req.file.filename } : 'null');
    console.log('Request body:', req.body);
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ message: 'Image is required' });
    }
    
    if (!req.file.id) {
      console.error('File uploaded but no ID:', req.file);
      return res.status(400).json({ message: 'File upload failed - no file ID received' });
    }
    
    const bannerData = {
      title: req.body.title || '',
      subtitle: req.body.subtitle || '',
      active: req.body.active !== 'false' && req.body.active !== false,
      order: Number(req.body.order || 0),
      fileId: req.file.id,
    };
    
    console.log('Creating banner with data:', bannerData);
    const banner = await Banner.create(bannerData);
    console.log('Banner created successfully:', banner._id);
    
    res.status(201).json(banner);
  } catch (err) {
    console.error('Banner creation error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      message: 'Failed to create banner', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

const getActiveBanners = async (_req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1, createdAt: -1 });
    const withUrls = banners.map((b) => ({
      ...b.toObject(),
      imageUrl: `/api/banners/${b._id}/image`,
    }));
    res.json(withUrls);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load banners', error: err.message });
  }
};

const getAllBanners = async (_req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    const withUrls = banners.map((b) => ({
      ...b.toObject(),
      imageUrl: `/api/banners/${b._id}/image`,
    }));
    res.json(withUrls);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load banners', error: err.message });
  }
};

const getBannerImage = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      console.error('Banner not found:', req.params.id);
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    if (!banner.fileId) {
      console.error('Banner has no fileId:', banner._id);
      return res.status(404).json({ message: 'Banner image not found' });
    }
    
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(banner.fileId);
    
    // Set CORS headers before streaming
    const origin = req.headers.origin;
    const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    const downloadStream = bucket.openDownloadStream(fileId);
    
    downloadStream.on('file', (file) => {
      if (!res.headersSent) {
        res.set('Content-Type', file.contentType || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=31536000');
      }
    });
    
    downloadStream.on('error', (err) => {
      console.error('Error streaming banner image:', err);
      if (!res.headersSent) {
        res.status(404).json({ message: 'Image not found' });
      } else {
        res.end();
      }
    });
    
    downloadStream.on('end', () => {
      console.log('Banner image streamed successfully:', banner._id);
    });
    
    downloadStream.pipe(res);
  } catch (err) {
    console.error('Error in getBannerImage:', err);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Failed to stream image', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error' 
      });
    }
  }
};

const updateBanner = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (typeof updates.active !== 'undefined') {
      updates.active = updates.active === 'true' || updates.active === true;
    }
    if (typeof updates.order !== 'undefined') {
      updates.order = Number(updates.order);
    }
    const banner = await Banner.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update banner', error: err.message });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    const bucket = getBucket();
    await bucket.delete(new mongoose.Types.ObjectId(banner.fileId));
    await banner.deleteOne();
    res.json({ message: 'Banner deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete banner', error: err.message });
  }
};

module.exports = {
  createBanner,
  getActiveBanners,
  getAllBanners,
  getBannerImage,
  updateBanner,
  deleteBanner,
};


