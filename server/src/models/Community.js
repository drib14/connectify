const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  options: [{
    text: String,
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  endsAt: Date,
  createdAt: { type: Date, default: Date.now },
});

const wikiPageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editHistory: [{
    editor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    editedAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
});

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 2000 },
  avatar: { type: String, default: '' },
  coverImage: { type: String, default: '' },

  type: {
    type: String,
    enum: [
      'general', 'neighborhood', 'habit', 'sharedGoal', 'temporary',
      'problemSolving', 'skillExchange', 'studyGroup', 'projectTeam',
      'volunteer', 'crisis', 'knowledge', 'anonymous'
    ],
    default: 'general',
  },

  // Members
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
  memberCount: { type: Number, default: 0 },

  // Creator
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Temporary Communities (Feature #11)
  isTemporary: { type: Boolean, default: false },
  expiresAt: { type: Date },

  // Neighborhood (Feature #12)
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: String,
    radius: { type: Number, default: 5 }, // km
  },

  // Community Voting (Feature #13)
  votes: [voteSchema],

  // Community Wiki (Feature #19)
  wiki: [wikiPageSchema],

  // Anonymous Posting (Feature #2)
  allowAnonymous: { type: Boolean, default: false },

  // Shared Goals (Feature #48)
  sharedGoal: {
    title: String,
    description: String,
    targetDate: Date,
    progress: { type: Number, default: 0 },
    milestones: [{
      title: String,
      completed: { type: Boolean, default: false },
      completedAt: Date,
    }],
  },

  // Problem Solving (Feature #50)
  problemData: {
    problemStatement: String,
    category: String,
    status: { type: String, enum: ['open', 'in_progress', 'solved', 'closed'], default: 'open' },
    solutions: [{
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      content: String,
      upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      isAccepted: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    }],
  },

  // Impact Tracking (Feature #49)
  impactMetrics: {
    volunteersEngaged: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    eventsHosted: { type: Number, default: 0 },
    knowledgeArticles: { type: Number, default: 0 },
    positiveInteractions: { type: Number, default: 0 },
  },

  // Crisis Hub (Feature #15)
  crisisData: {
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    isActive: { type: Boolean, default: false },
    emergencyContacts: [{ name: String, phone: String }],
    resources: [{ title: String, url: String }],
  },

  // Volunteer (Feature #14)
  volunteerData: {
    opportunities: [{
      title: String,
      description: String,
      date: Date,
      location: String,
      spotsAvailable: Number,
      signedUp: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    }],
  },

  // Tags & Categories
  tags: [{ type: String, trim: true }],
  category: String,
  isPrivate: { type: Boolean, default: false },

}, { timestamps: true });

// Geospatial index for neighborhood communities
communitySchema.index({ 'location': '2dsphere' });
communitySchema.index({ type: 1 });
communitySchema.index({ tags: 1 });

module.exports = mongoose.model('Community', communitySchema);
