const Booking = require('../models/Booking');
const User = require('../models/User');
const Theatre = require('../models/Theatre');
const { sendBookingEmail } = require('../utils/emailService');


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

    let paymentStatus = 'pending';
    let paymentId = null;

    // Handle Wallet Payment
    if (req.body.paymentMethod === 'wallet') {
      const user = await User.findById(req.user._id);
      if (user.walletBalance >= totalPrice) {
        user.walletBalance -= totalPrice;
        await user.save();
        paymentStatus = 'completed';
        paymentId = 'WALLET_' + Date.now();
      } else {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }
    }

    const booking = await Booking.create({
      userId: req.user._id,
      movieId,
      theatreId,
      showId,
      seats,
      totalPrice,
      showtime,
      paymentStatus,
      paymentId,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


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


const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId, paymentMethod } = req.body;
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('movieId', 'title poster')
      .populate('theatreId', 'name location');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Handle wallet payment
    if (paymentMethod === 'wallet' && paymentStatus === 'completed') {
      console.log('Processing wallet payment for booking:', req.params.id);
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('User wallet balance before:', user.walletBalance);
      console.log('Booking price:', booking.totalPrice);

      if (user.walletBalance < booking.totalPrice) {
        return res.status(400).json({ message: 'Insufficient wallet balance' });
      }

      // Deduct from wallet
      user.walletBalance -= booking.totalPrice;
      await user.save();

      console.log('User wallet balance after:', user.walletBalance);

      booking.paymentStatus = 'completed';
      booking.paymentId = `WALLET_${Date.now()}`;
    } else {
      booking.paymentStatus = paymentStatus;
      if (paymentId) {
        booking.paymentId = paymentId;
      }
    }

    await booking.save();

    // Send confirmation email if payment is completed
    if (booking.paymentStatus === 'completed') {
      await sendBookingEmail(booking);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if cancellation is allowed (2 hours before showtime)
    const showtime = new Date(booking.showtime);
    const timeDiff = showtime - Date.now();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 2) {
      return res.status(400).json({ message: 'Cannot cancel booking within 2 hours of showtime' });
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

    // Refund to wallet only if payment was completed
    if (booking.paymentStatus === 'completed') {
      const user = await User.findById(booking.userId);
      if (user) {
        console.log('Refunding to wallet - Before:', user.walletBalance);
        console.log('Refund amount:', booking.totalPrice);

        // Ensure walletBalance exists
        if (typeof user.walletBalance !== 'number') {
          user.walletBalance = 0;
        }

        user.walletBalance += booking.totalPrice;
        await user.save();

        console.log('Refunding to wallet - After:', user.walletBalance);
      }
    }

    booking.paymentStatus = 'cancelled';
    await booking.save();

    const message = booking.paymentStatus === 'completed'
      ? `Booking cancelled successfully. ₹${booking.totalPrice} refunded to wallet.`
      : 'Booking cancelled successfully.';

    res.json({ message });
  } catch (error) {
    console.error('Cancel booking error:', error);
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

