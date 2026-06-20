const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  coverPic: {
    type: String,
    default: '',
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  privacy: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  pendingMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  rules: [{
    type: String,
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Group', GroupSchema);
