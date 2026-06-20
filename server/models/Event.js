const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  organizer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  going: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  interested: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }]
}, {
  timestamps: true,
});

module.exports = mongoose.model('Event', EventSchema);
