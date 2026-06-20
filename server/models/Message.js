const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
  mediaUrl: {
    type: String,
    default: '',
  },
  chatRoom: {
    type: Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: true,
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', MessageSchema);
