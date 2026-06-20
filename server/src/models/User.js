const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 500 },
  location: { type: String, default: '' },
  website: { type: String, default: '' },

  // Trust Circles (Feature #1)
  trustCircles: {
    family: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    coworkers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    classmates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },

  // Skill Showcase (Feature #18)
  skills: [{ type: String, trim: true }],
  skillShowcase: [{
    title: String,
    description: String,
    media: [String],
    link: String,
    tags: [String],
    createdAt: { type: Date, default: Date.now },
  }],

  // Verified Expertise (Feature #44)
  verifiedExpertise: [{
    field: String,
    description: String,
    verifiedBy: String,
    verifiedAt: Date,
  }],

  // Reputation (Features #41, #42, #45)
  contributionScore: { type: Number, default: 0 },
  communityTrustRating: { type: Number, default: 50, min: 0, max: 100 },
  constructiveFeedbackScore: { type: Number, default: 0 },
  authenticityBadges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now },
  }],

  // Mental Health Settings (Features #6, #7, #8)
  likeFreeModeEnabled: { type: Boolean, default: false },
  slowFeedEnabled: { type: Boolean, default: false },
  feedRefreshLimit: { type: Number, default: 20 },
  socialBurnoutSettings: {
    enabled: { type: Boolean, default: true },
    dailyLimitMinutes: { type: Number, default: 120 },
    breakReminderMinutes: { type: Number, default: 45 },
    todayUsageMinutes: { type: Number, default: 0 },
    lastResetDate: { type: Date, default: Date.now },
  },

  // Disposable Profiles (Feature #3)
  disposableProfiles: [{
    displayName: String,
    avatar: String,
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
  }],

  // Digital Legacy (Feature #5)
  digitalLegacy: {
    enabled: { type: Boolean, default: false },
    action: { type: String, enum: ['memorialize', 'delete', 'transfer'], default: 'memorialize' },
    trustedContact: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
  },

  // Accountability (Feature #30)
  accountabilityPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accountabilityRequests: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  }],

  // Topic Following (Feature #37)
  followingTopics: [{ type: String, trim: true }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Monetization
  coins: { type: Number, default: 0 },
  isPremium: { type: Boolean, default: false },

  // Auth & Terms
  agreedToTerms: { type: Boolean, default: false },
  termsAgreedAt: { type: Date },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  refreshToken: { type: String },

  // Mood tracking (Feature #10)
  currentMood: {
    mood: { type: String, enum: ['happy', 'sad', 'anxious', 'excited', 'neutral', 'grateful', 'frustrated', 'hopeful', 'tired', 'inspired', ''] },
    updatedAt: Date,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// JSON serialization - hide sensitive fields
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  delete user.verificationToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);
