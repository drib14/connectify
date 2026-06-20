const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['event', 'community', 'skillExchange', 'project', 'course', 'product'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetName: String,
  content: { type: String, required: true, maxlength: 3000 },
  rating: { type: Number, required: true, min: 1, max: 5 },

  // Verification (Feature #17)
  isVerified: { type: Boolean, default: false },
  verificationProof: {
    type: { type: String, enum: ['attendance', 'purchase', 'membership', 'participation'] },
    evidence: String,
    verifiedAt: Date,
  },

  // Engagement
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notHelpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now },
  }],

  tags: [String],
}, { timestamps: true });

reviewSchema.index({ targetType: 1, targetId: 1 });
reviewSchema.index({ author: 1 });

module.exports = mongoose.model('Review', reviewSchema);
