const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a movie title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  genre: {
    type: [String],
    required: [true, 'Please provide at least one genre'],
  },
  poster: {
    type: String,
    required: [true, 'Please provide a poster URL'],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 10,
  },
  cast: {
    type: [String],
    default: [],
  },
  releaseDate: {
    type: Date,
    required: [true, 'Please provide a release date'],
  },
  trailerURL: {
    type: String,
    default: '',
  },
  tmdbId: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Movie', movieSchema);

