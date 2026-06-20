const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
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
  mediaType: {
    type: String,
    enum: ['image', 'video', ''],
    default: '',
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  reactions: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
      default: 'like',
    }
  }],
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    replies: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      }
    }]
  }],
  isShared: {
    type: Boolean,
    default: false,
  },
  originalPost: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    default: null,
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    default: null,
  },
  page: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
    default: null,
  },
  isPoll: {
    type: Boolean,
    default: false,
  },
  pollOptions: [{
    optionText: {
      type: String,
      required: true,
    },
    votes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }]
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Post', PostSchema);
