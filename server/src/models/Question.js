const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAccepted: { type: Boolean, default: false },
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

const questionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 300 },
  content: { type: String, required: true, maxlength: 5000 },
  tags: [{ type: String, trim: true }],
  category: { type: String, enum: ['tech', 'science', 'arts', 'health', 'business', 'education', 'lifestyle', 'other'], default: 'other' },

  answers: [answerSchema],
  bestAnswer: { type: mongoose.Schema.Types.ObjectId },

  // Reward System (Feature #20)
  rewardPoints: { type: Number, default: 10 },
  isBounty: { type: Boolean, default: false },
  bountyAmount: { type: Number, default: 0 },

  // Engagement
  views: { type: Number, default: 0 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  status: { type: String, enum: ['open', 'answered', 'closed'], default: 'open' },

}, { timestamps: true });

questionSchema.index({ tags: 1 });
questionSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);
