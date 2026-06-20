const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Signup
router.post('/signup', authController.signup);

// Login
router.post('/login', authController.login);

// Refresh token
router.post('/refresh', authController.refresh);

// Forgot Password - Send OTP
router.post('/forgot-password', authController.forgotPassword);

// Verify OTP
router.post('/verify-otp', authController.verifyOTP);

// Reset Password
router.post('/reset-password', authController.resetPassword);

module.exports = router;
