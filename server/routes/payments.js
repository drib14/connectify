const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// Create Checkout Session
router.post('/checkout', auth, paymentController.checkout);

// Verify Checkout Session and Upgrade user
router.post('/verify-premium', auth, paymentController.verifyPremium);

module.exports = router;
