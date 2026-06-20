const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 2000 },
  category: { type: String, enum: ['fitness', 'education', 'career', 'personal', 'creative', 'financial', 'social', 'health', 'other'], default: 'personal' },

  // Progress
  progress: { type: Number, default: 0, min: 0, max: 100 },
  milestones: [{
    title: String,
    description: String,
    completed: { type: Boolean, default: false },
    completedAt: Date,
    targetDate: Date,
  }],

  // Timeline (Feature #29)
  timeline: [{
    title: String,
    description: String,
    type: { type: String, enum: ['milestone', 'update', 'reflection', 'achievement'] },
    media: [String],
    date: { type: Date, default: Date.now },
  }],

  // Accountability Partner (Feature #30)
  accountabilityPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  checkIns: [{
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['on_track', 'behind', 'ahead', 'completed'] },
    note: String,
    partnerFeedback: String,
  }],

  // Shared Goal Community (Feature #48)
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },

  // Visibility
  isPublic: { type: Boolean, default: true },
  targetDate: Date,
  status: { type: String, enum: ['active', 'completed', 'paused', 'abandoned'], default: 'active' },
  completedAt: Date,

}, { timestamps: true });

goalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
