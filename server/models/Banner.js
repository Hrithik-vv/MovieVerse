const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  subtitle: { type: String, trim: true },
  ctaText: { type: String, trim: true },
  ctaLink: { type: String, trim: true },
  active: { type: Boolean, default: true, index: true },
  order: { type: Number, default: 0, index: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Banner', bannerSchema);


