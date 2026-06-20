const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entries: [{
    date: { type: Date, default: Date.now },
    mood: { type: String, enum: ['great', 'good', 'okay', 'low', 'bad'] },
    reflection: { type: String, maxlength: 5000 },
    gratitude: [String],
    activitySummary: {
      postsCreated: { type: Number, default: 0 },
      commentsGiven: { type: Number, default: 0 },
      likesGiven: { type: Number, default: 0 },
      timeSpentMinutes: { type: Number, default: 0 },
      newConnections: { type: Number, default: 0 },
    },
    goals: [String],
    isPrivate: { type: Boolean, default: true },
  }],
  weeklyInsights: [{
    weekStart: Date,
    weekEnd: Date,
    averageMood: String,
    totalTimeMinutes: Number,
    topActivities: [String],
    generatedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

journalSchema.index({ user: 1 });

module.exports = mongoose.model('Journal', journalSchema);
