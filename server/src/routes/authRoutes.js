const express = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('firstName').trim().notEmpty().withMessage('First name is required.').isLength({ min: 2 }).withMessage('First name must be at least 2 characters.'),
  body('lastName').trim().notEmpty().withMessage('Last name is required.').isLength({ min: 2 }).withMessage('Last name must be at least 2 characters.'),
  body('email').isEmail().withMessage('Please provide a valid email.').normalizeEmail(),
  body('username').trim().notEmpty().withMessage('Username is required.').isLength({ min: 3 }).withMessage('Username must be at least 3 characters.').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  body('confirmPassword').notEmpty().withMessage('Please confirm your password.'),
  body('agreedToTerms').equals('true').withMessage('You must agree to the Terms of Service.'),
], register);

// Login
router.post('/login', [
  body('emailOrUsername').trim().notEmpty().withMessage('Email or username is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
], login);

// Refresh token
router.post('/refresh', refresh);

// Logout
router.post('/logout', auth, logout);

// Get current user
router.get('/me', auth, getMe);

module.exports = router;
