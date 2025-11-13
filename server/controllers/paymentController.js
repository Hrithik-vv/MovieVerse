const Razorpay = require('razorpay');
const Booking = require('../models/Booking');

const getRazorpaySecret = () =>
  process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET;

const hasRazorpayConfig = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && getRazorpaySecret());

const razorpay = hasRazorpayConfig()
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: getRazorpaySecret(),
    })
  : null;

// Log Razorpay config status on startup
if (hasRazorpayConfig()) {
  console.log('✓ Razorpay configured with key_id:', process.env.RAZORPAY_KEY_ID);
  console.log('✓ Razorpay secret:', getRazorpaySecret() ? '***' + getRazorpaySecret().slice(-4) : 'MISSING');
} else {
  console.warn('⚠ Razorpay not configured - missing KEY_ID or SECRET');
}

// @desc    Create payment order
// @route   POST /api/payment/create-order
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { amount, bookingId } = req.body;

    if (!amount || !bookingId) {
      return res.status(400).json({ message: 'Amount and bookingId are required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    if (!hasRazorpayConfig()) {
      return res.json({
        mock: true,
        orderId: `mock_order_${bookingId}_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
      });
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${bookingId}`,
    };

    try {
      const order = await razorpay.orders.create(options);

      return res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        mock: false,
      });
    } catch (razorErr) {
      const errorMessage =
        razorErr?.error?.description ||
        razorErr?.error?.field ||
        razorErr?.message ||
        'Unknown Razorpay error';

      const fullError = razorErr?.error || razorErr;
      
      console.error('❌ Razorpay order creation failed:');
      console.error('   Error message:', errorMessage);
      console.error('   Full error:', JSON.stringify(fullError, null, 2));
      console.error('   Key ID used:', process.env.RAZORPAY_KEY_ID);
      console.error('   Secret present:', getRazorpaySecret() ? 'Yes (***' + getRazorpaySecret().slice(-4) + ')' : 'NO');

      return res.json({
        mock: true,
        orderId: `mock_order_${bookingId}_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        error: errorMessage,
        details: fullError, // Include full error details for debugging
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      mock,
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'bookingId is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const shouldBypassVerification = mock || !hasRazorpayConfig();

    if (!shouldBypassVerification) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res
          .status(400)
          .json({ message: 'Missing Razorpay payment details', success: false });
      }

      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', getRazorpaySecret());
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (generated_signature !== razorpay_signature) {
        return res
          .status(400)
          .json({ message: 'Payment verification failed', success: false });
      }
    }

    booking.paymentStatus = 'completed';
    booking.paymentId = razorpay_payment_id || `mock_payment_${Date.now()}`;
    await booking.save();

    res.json({ message: 'Payment verified successfully', success: true, mock: shouldBypassVerification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, verifyPayment };

