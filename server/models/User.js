const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth
  profileImage: { type: String },
  isVerified: { type: Boolean, default: false },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String },

  // Verification / OTP fields
  verificationToken: { type: String },
  resetPasswordOtp: { type: String },
  resetPasswordOtpExpiry: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
