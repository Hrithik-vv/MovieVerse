const Booking = require('../models/Booking');
const Theatre = require('../models/Theatre');
const sendBookingEmail = require('../utils/emailService');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { movieId, theatreId, showId, seats, totalPrice, showtime } = req.body;

    if (!movieId || !theatreId || !showId || !seats || !totalPrice) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
      return res.status(404).json({ message: 'Theatre not found' });
    }

    const show = theatre.shows.id(showId);
    if (!show) {
      return res.status(404).json({ message: 'Show not found' });
    }

    // Check if seats are available
    for (const [row, col] of seats) {
      if (show.seats[row] && show.seats[row][col]) {
        return res.status(400).json({ message: 'One or more seats are already booked' });
      }
    }

    // Mark seats as booked
    for (const [row, col] of seats) {
      if (!show.seats[row]) {
        show.seats[row] = [];
      }
      show.seats[row][col] = true;
    }

    await theatre.save();

    const booking = await Booking.create({
      userId: req.user._id,
      movieId,
      theatreId,
      showId,
      seats,
      totalPrice,
      showtime,
      paymentStatus: 'pending',
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('movieId', 'title poster')
      .populate('theatreId', 'name location')
      .sort({ bookingTime: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('movieId', 'title poster')
      .populate('theatreId', 'name location')
      .sort({ bookingTime: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('movieId', 'title poster')
      .populate('theatreId', 'name location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns booking or is admin
    if (booking.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('movieId', 'title poster')
      .populate('theatreId', 'name location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentId) {
      booking.paymentId = paymentId;
    }

    await booking.save();

    // Send confirmation email if payment is completed
    if (paymentStatus === 'completed') {
      await sendBookingEmail(booking);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Free up seats
    const theatre = await Theatre.findById(booking.theatreId);
    if (theatre) {
      const show = theatre.shows.id(booking.showId);
      if (show) {
        for (const [row, col] of booking.seats) {
          if (show.seats[row] && show.seats[row][col]) {
            show.seats[row][col] = false;
          }
        }
        await theatre.save();
      }
    }

    booking.paymentStatus = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
  cancelBooking,
};

