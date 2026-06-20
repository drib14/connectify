const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  isAnonymous: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replies: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, maxlength: 2000 },
    isAnonymous: { type: Boolean, default: false },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, maxlength: 5000 },
  media: [{
    url: String,
    type: { type: String, enum: ['image', 'video', 'document'] },
    publicId: String,
  }],

  // Post Type
  postType: {
    type: String,
    enum: [
      'regular', 'anonymous', 'realityCheck', 'noFilter',
      'dailySnapshot', 'timeCapsule', 'goalUpdate', 'knowledgeShare',
      'moodPost', 'challengeEntry', 'skillShowcase', 'volunteerCall',
      'crisisAlert', 'contextNote'
    ],
    default: 'regular',
  },

  // Trust Circle Visibility (Feature #1)
  visibility: {
    type: String,
    enum: ['public', 'family', 'friends', 'coworkers', 'classmates', 'custom'],
    default: 'public',
  },
  customVisibility: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Anonymous Posting (Feature #2)
  isAnonymous: { type: Boolean, default: false },
  anonymousCommunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },

  // Mood Tag (Feature #10)
  moodTag: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'excited', 'neutral', 'grateful', 'frustrated', 'hopeful', 'tired', 'inspired', ''],
    default: '',
  },

  // Reality Check (Feature #21) - success and struggle pair
  realityCheckData: {
    success: String,
    struggle: String,
  },

  // Context Notes (Feature #24)
  contextNotes: { type: String, maxlength: 1000 },

  // Content Lifespan (Feature #40)
  contentLifespan: {
    enabled: { type: Boolean, default: false },
    expiresAt: Date,
  },

  // Time Capsule (Feature #46)
  timeCapsuleData: {
    unlockDate: Date,
    isUnlocked: { type: Boolean, default: false },
  },

  // Knowledge Share metadata (Feature #16)
  knowledgeData: {
    category: String,
    tags: [String],
    sources: [String],
  },

  // Engagement
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  shares: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  // Fact Check (Feature #43)
  factCheckRequests: [{
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'verified', 'disputed', 'false'], default: 'pending' },
    evidence: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  }],

  // Community reference
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },

  // Topic tags (Feature #37)
  topics: [{ type: String, trim: true }],

  // Deep Discussion (Feature #39)
  isDeepDiscussion: { type: Boolean, default: false },
  discussionDepthLimit: { type: Number, default: 0 },

}, { timestamps: true });

// Index for efficient querying
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ topics: 1 });
postSchema.index({ postType: 1 });
postSchema.index({ 'contentLifespan.expiresAt': 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Post', postSchema);
