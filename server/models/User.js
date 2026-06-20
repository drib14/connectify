const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    trim: true,
    default: '',
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
  },
  gender: {
    type: String,
    enum: ['female', 'male', 'custom', ''],
    default: '',
  },
  dateOfBirth: {
    type: Date,
    default: null,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: '',
  },
  coverPic: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  friends: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  friendRequests: [{
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumUntil: {
    type: Date,
    default: null,
  },
  sparkPoints: {
    type: Number,
    default: 0,
  },
  dailyChallenges: {
    goals: [
      {
        name: { type: String, required: true },
        completed: { type: Boolean, default: false },
        type: { type: String, required: true }, // 'post', 'like', 'message', 'poll_vote'
        target: { type: Number, default: 1 },
        current: { type: Number, default: 0 },
      }
    ],
    lastReset: {
      type: Date,
      default: Date.now,
    }
  },
  verificationOTP: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
