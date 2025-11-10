const express = require('express');
const router = express.Router();
const { register, login, getMe, googleLogin, requestPasswordOtp, resetPasswordWithOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password/request-otp', requestPasswordOtp);
router.post('/forgot-password/reset', resetPasswordWithOtp);
router.get('/me', protect, getMe);

module.exports = router;

