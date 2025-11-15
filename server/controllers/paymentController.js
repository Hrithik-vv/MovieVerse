const crypto = require('crypto');
const Booking = require('../models/Booking');
const { getRazorpayInstance, isRazorpayConfigured, getRazorpaySecret } = require('../config/razorpayConfig');


const createOrder = async (req, res) => {
  try {
    console.log('📝 Create order request received');
    console.log('   User:', req.user?._id || 'No user');
    console.log('   Body:', req.body);
    
   
    if (!req.user || !req.user._id) {
      console.error(' User not authenticated');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const { amount, bookingId } = req.body;

    // Validate required fields
    if (!amount || !bookingId) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount and bookingId are required' 
      });
    }

    // Validate amount is a positive number
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount must be a positive number' 
      });
    }

    // Check if Razorpay is configured
    console.log('🔍 Checking Razorpay configuration...');
    if (!isRazorpayConfigured()) {
      console.error(' Razorpay not configured');
      console.error('   RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing');
      console.error('   RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Missing');
      console.error('   RAZORPAY_SECRET:', process.env.RAZORPAY_SECRET ? 'Set' : 'Missing');
      return res.status(500).json({ 
        success: false,
        message: 'Payment gateway is not configured. Please contact administrator.' 
      });
    }
    console.log('✓ Razorpay is configured');

    // Find booking
    console.log('🔍 Finding booking:', bookingId);
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.error(' Booking not found:', bookingId);
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    console.log('✓ Booking found');

    // Check if booking is already paid
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'This booking has already been paid' 
      });
    }

   
    const amountInPaise = Math.round(numericAmount * 100);

    // Create Razorpay order options
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `booking_${bookingId}_${Date.now()}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: req.user._id.toString(),
      },
    };

    try {
      // Get Razorpay instance and create order
      console.log('🔧 Getting Razorpay instance...');
      const razorpay = getRazorpayInstance();
      console.log('✓ Razorpay instance obtained');
      
      console.log('📦 Creating Razorpay order with options:', {
        amount: orderOptions.amount,
        currency: orderOptions.currency,
        receipt: orderOptions.receipt
      });
      
      const order = await razorpay.orders.create(orderOptions);
      console.log('✓ Razorpay order created:', order.id);

      // Return order details to frontend
      return res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (razorpayError) {
      console.error(' Razorpay error caught:');
      // Handle Razorpay API errors
      const errorMessage =
        razorpayError?.error?.description ||
        razorpayError?.error?.field ||
        razorpayError?.error?.reason ||
        razorpayError?.message ||
        'Failed to create payment order';

      const errorCode = razorpayError?.error?.code || razorpayError?.error?.field;
      const errorReason = razorpayError?.error?.reason || '';

      console.error(' Razorpay order creation failed:');
      console.error('   Error Code:', errorCode);
      console.error('   Error Message:', errorMessage);
      console.error('   Error Reason:', errorReason);
      console.error('   Full error:', JSON.stringify(razorpayError, null, 2));
      console.error('   Booking ID:', bookingId);
      console.error('   Amount:', amountInPaise);
      console.error('   Key ID used:', process.env.RAZORPAY_KEY_ID);

      
      if (errorMessage.includes('Authentication failed') || 
          errorMessage.includes('authentication') ||
          errorCode === 'BAD_REQUEST_ERROR' ||
          errorReason === 'authentication_failed') {
        return res.status(401).json({
          success: false,
          message: 'Razorpay authentication failed. Please check your API keys (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) in the .env file.',
          error: 'Authentication failed',
          details: 'The Razorpay API keys are invalid or incorrect. Please verify your keys in the Razorpay dashboard.'
        });
      }

      // Check if it's a configuration error
      if (errorMessage.includes('not configured') || errorMessage.includes('RAZORPAY')) {
        return res.status(500).json({
          success: false,
          message: 'Payment gateway is not properly configured. Please contact administrator.',
          error: 'Configuration error',
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order. Please try again.',
        error: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { 
          details: errorReason,
          code: errorCode 
        })
      });
    }
  } catch (error) {
    console.error(' Error in createOrder (outer catch):');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   Name:', error.name);
    console.error('   Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Check if it's a Razorpay configuration error
    if (error.message && error.message.includes('not configured')) {
      return res.status(500).json({ 
        success: false,
        message: 'Payment gateway is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.'
      });
    }
    
    // Return detailed error in development, generic in production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    return res.status(500).json({ 
      success: false,
      message: isDevelopment ? error.message : 'Internal server error',
      ...(isDevelopment && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Validate required fields
    if (!bookingId) {
      return res.status(400).json({ 
        success: false,
        message: 'bookingId is required' 
      });
    }

    // Check if Razorpay is configured
    if (!isRazorpayConfigured()) {
      return res.status(500).json({ 
        success: false,
        message: 'Payment gateway is not configured. Please contact administrator.' 
      });
    }

    // Validate Razorpay payment details
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing Razorpay payment details. All payment fields are required.' 
      });
    }

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'This booking has already been paid' 
      });
    }

    // Verify payment signature
    
    const secret = getRazorpaySecret();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    // Compare signatures
    if (generated_signature !== razorpay_signature) {
      console.error(' Payment signature verification failed');
      console.error('   Order ID:', razorpay_order_id);
      console.error('   Payment ID:', razorpay_payment_id);
      console.error('   Expected:', generated_signature);
      console.error('   Received:', razorpay_signature);

      return res.status(400).json({ 
        success: false,
        message: 'Payment verification failed. Invalid signature.' 
      });
    }

    // Signature verified - update booking
    booking.paymentStatus = 'completed';
    booking.paymentId = razorpay_payment_id;
    booking.paymentDate = new Date();
    await booking.save();

    console.log('✓ Payment verified successfully');
    console.log('   Booking ID:', bookingId);
    console.log('   Payment ID:', razorpay_payment_id);

    return res.status(200).json({ 
      success: true,
      message: 'Payment verified successfully',
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message || 'Internal server error' 
    });
  }
};

module.exports = { createOrder, verifyPayment };

