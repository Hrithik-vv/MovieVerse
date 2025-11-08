const Razorpay = require('razorpay');
const Booking = require('../models/Booking');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// @desc    Create payment order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      // Update booking payment status
      const booking = await Booking.findById(bookingId);
      if (booking) {
        booking.paymentStatus = 'completed';
        booking.paymentId = razorpay_payment_id;
        await booking.save();
      }

      res.json({ message: 'Payment verified successfully', success: true });
    } else {
      res.status(400).json({ message: 'Payment verification failed', success: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment };

