const crypto = require('crypto');
const Booking = require('../models/Booking');

// PayU Credentials
const PAYU_KEY = process.env.PAYU_KEY;
const PAYU_SALT = process.env.PAYU_SALT;

const generatePayUHash = async (req, res) => {
  try {
    const { txnid, amount, productinfo, firstname, email } = req.body;

    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields for hash generation'
      });
    }

    const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    res.status(200).json({
      success: true,
      hash: hash,
      key: PAYU_KEY
    });
  } catch (error) {
    console.error('Error generating PayU hash:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment hash'
    });
  }
};

const handlePayUResponse = async (req, res) => {
  try {
    const { txnid, status, hash, amount, productinfo, firstname, email, mihpayid } = req.body;

    // Verify hash
    const hashString = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${PAYU_KEY}`;
    const expectedHash = crypto.createHash('sha512').update(hashString).digest('hex');

    if (hash !== expectedHash) {
      console.error('PayU hash verification failed');
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?message=Hash verification failed`);
    }

    if (status === 'success') {
      // Update booking status
      // Assuming productinfo contains the booking ID or we pass it in ud1
      // For this implementation, let's assume productinfo IS the booking ID or we parse it
      // In the frontend we should send bookingId as productinfo

      const bookingId = productinfo;
      const booking = await Booking.findById(bookingId);

      if (booking) {
        booking.paymentStatus = 'completed';
        booking.paymentId = mihpayid; // PayU ID
        booking.paymentDate = new Date();
        await booking.save();
      }

      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?bookingId=${bookingId}`);
    } else {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?message=Payment failed`);
    }
  } catch (error) {
    console.error('Error handling PayU response:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?message=Internal server error`);
  }
};

module.exports = { generatePayUHash, handlePayUResponse };

