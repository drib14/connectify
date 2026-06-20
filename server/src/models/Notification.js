const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: [
      'like', 'comment', 'follow', 'mention', 'share',
      'trustCircleAdd', 'goalUpdate', 'accountabilityCheckIn',
      'challengeInvite', 'communityInvite', 'eventReminder',
      'crisisAlert', 'factCheckResult', 'badgeEarned',
      'timeCapsuleUnlocked', 'burnoutWarning', 'partnerRequest',
      'volunteerMatch', 'projectInvite', 'welcome', 'tip',
    ],
    required: true,
  },
  message: { type: String, required: true },
  link: String,
  read: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
