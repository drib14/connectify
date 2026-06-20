const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 3000 },
  type: {
    type: String,
    enum: ['noFilter', 'dailySnapshot', 'habit', 'fitness', 'creative', 'learning', 'social', 'custom'],
    default: 'custom',
  },
  rules: [String],
  duration: { type: Number, default: 7 }, // days
  startDate: { type: Date, default: Date.now },
  endDate: Date,

  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0 },
    submissions: [{
      content: String,
      media: [String],
      day: Number,
      submittedAt: { type: Date, default: Date.now },
    }],
  }],

  maxParticipants: Number,
  coverImage: String,
  tags: [String],
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  status: { type: String, enum: ['upcoming', 'active', 'completed', 'cancelled'], default: 'upcoming' },

}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
