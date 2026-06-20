const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendWelcomeEmail } = require('../services/emailService');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Register
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, username, password, confirmPassword, agreedToTerms } = req.body;

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Check terms agreement
    if (!agreedToTerms) {
      return res.status(400).json({ message: 'You must agree to the Terms of Service.' });
    }

    // Check existing user
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({ message: 'This username is already taken.' });
    }

    // Create user
    const user = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      password,
      agreedToTerms: true,
      termsAgreedAt: new Date(),
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    // Create welcome notification
    await Notification.create({
      recipient: user._id,
      type: 'welcome',
      message: `Welcome to Connectify, ${user.firstName}! 🎉 Start by setting up your Trust Circles and exploring communities.`,
      link: '/settings/trust-circles',
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user);

    res.status(201).json({
      message: 'Registration successful! Welcome to Connectify.',
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Please provide email/username and password.' });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername.toLowerCase() },
      ],
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful!',
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// Refresh Token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required.' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token.' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid refresh token.' });
  }
};

// Logout
const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout.' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshToken')
      .populate('trustCircles.family', 'firstName lastName username avatar')
      .populate('trustCircles.friends', 'firstName lastName username avatar')
      .populate('trustCircles.coworkers', 'firstName lastName username avatar')
      .populate('trustCircles.classmates', 'firstName lastName username avatar')
      .populate('accountabilityPartner', 'firstName lastName username avatar');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { register, login, refresh, logout, getMe };
