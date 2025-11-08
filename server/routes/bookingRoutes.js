const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updatePaymentStatus,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/mybookings', protect, getMyBookings);
router.get('/', protect, admin, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/payment', protect, updatePaymentStatus);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;

