const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, maxlength: 3000 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  type: {
    type: String,
    enum: ['meetup', 'challenge', 'skillExchange', 'studySession', 'volunteer', 'noFilter', 'general'],
    default: 'general',
  },

  // Location & Time
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] },
    address: String,
    isOnline: { type: Boolean, default: false },
    onlineLink: String,
  },
  date: { type: Date, required: true },
  endDate: Date,

  // Attendees
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['going', 'interested', 'declined'], default: 'interested' },
    joinedAt: { type: Date, default: Date.now },
  }],
  maxAttendees: Number,

  // Collaboration Album (Feature #32)
  collaborationAlbum: [{
    contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    media: { url: String, type: { type: String }, publicId: String },
    caption: String,
    addedAt: { type: Date, default: Date.now },
  }],

  // Skill Exchange (Feature #33)
  skillExchangeData: {
    skillOffered: String,
    skillWanted: String,
    experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  },

  // Study Session (Feature #34)
  studySessionData: {
    subject: String,
    level: String,
    materials: [String],
  },

  // Meet-Up Matching (Feature #31)
  matchCriteria: {
    interests: [String],
    ageRange: { min: Number, max: Number },
    maxDistance: Number,
  },

  // Community reference
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community' },
  coverImage: String,
  tags: [String],
  isPrivate: { type: Boolean, default: false },

}, { timestamps: true });

eventSchema.index({ 'location': '2dsphere' });
eventSchema.index({ date: 1 });
eventSchema.index({ type: 1 });

module.exports = mongoose.model('Event', eventSchema);
