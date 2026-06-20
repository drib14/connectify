const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TimeCapsuleSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  mediaUrl: {
    type: String,
    default: '',
  },
  mediaType: {
    type: String,
    default: '', // 'image' or 'video'
  },
  unlockDate: {
    type: Date,
    required: true,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

// Virtual attribute checking if unlock date is reached
TimeCapsuleSchema.virtual('isUnlocked').get(function() {
  return new Date() >= this.unlockDate;
});

TimeCapsuleSchema.set('toJSON', { virtuals: true });
TimeCapsuleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TimeCapsule', TimeCapsuleSchema);
