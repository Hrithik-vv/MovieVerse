const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5,
  },
}, {
  timestamps: true,
});

// Prevent duplicate reviews from same user for same movie
reviewSchema.index({ movieId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

