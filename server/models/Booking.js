const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  theatreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theatre',
    required: true,
  },
  showId: {
    type: String,
    required: true,
  },
  seats: {
    type: [[Number]],
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending',
  },
  paymentId: {
    type: String,
    default: '',
  },
  bookingTime: {
    type: Date,
    default: Date.now,
  },
  showtime: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);

