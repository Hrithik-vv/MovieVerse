const express = require('express');
const router = express.Router();
const { generatePayUHash, handlePayUResponse } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/hash', protect, generatePayUHash);
router.post('/response', handlePayUResponse);

module.exports = router;

