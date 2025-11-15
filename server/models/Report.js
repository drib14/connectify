const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reportedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    reportedComment: {
      // Storing as an object since we don't have a standalone Comment model
      commentId: mongoose.Schema.Types.ObjectId,
      text: String,
    },
    reason: {
      type: String,
      required: true,
    },
    customReason: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
    adminAction: {
      type: String,
    },
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
