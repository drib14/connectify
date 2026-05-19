const express = require('express');
const router = express.Router();
const {
    register,
    verifyEmail,
    login,
    forgotPassword,
    verifyOtp,
    resetPassword,
    googleAuth
} = require('../controllers/authController');

router.post('/register', register);
router.get('/verify/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);

module.exports = router;
