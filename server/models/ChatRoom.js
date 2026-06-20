const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
  name: {
    type: String,
    default: '', // Used for group chats
  },
  isGroup: {
    type: Boolean,
    default: false,
  },
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message',
    default: null,
  },
  // Co-Watching Lounge Sync Data
  coWatchVideoUrl: {
    type: String,
    default: '', // Embeddable YouTube URL or MP4 source
  },
  coWatchPlaybackTime: {
    type: Number,
    default: 0, // Video timestamp in seconds
  },
  coWatchIsPlaying: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);
