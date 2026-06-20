const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageSchema = new Schema({
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
  category: {
    type: String,
    default: 'Business',
  },
  profilePic: {
    type: String,
    default: '',
  },
  coverPic: {
    type: String,
    default: '',
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  viewsCount: {
    type: Number,
    default: 0,
  },
  clicksCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Page', PageSchema);
