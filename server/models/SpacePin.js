const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpacePinSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  statusMessage: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['social', 'study', 'food', 'gaming', 'chilling'],
    default: 'social',
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // MongoDB TTL index to auto-delete after expiresAt
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('SpacePin', SpacePinSchema);
