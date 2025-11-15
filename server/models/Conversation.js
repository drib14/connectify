const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
