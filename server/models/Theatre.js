const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  showtime: {
    type: Date,
    required: true,
  },
  screen: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  seats: {
    type: [[Boolean]],
    default: function() {
      // Default 10x10 seat grid
      return Array(10).fill(null).map(() => Array(10).fill(false));
    },
  },
});

const theatreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a theatre name'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true,
  },
  screens: {
    type: [String],
    required: [true, 'Please provide at least one screen'],
  },
  shows: [showSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Theatre', theatreSchema);

