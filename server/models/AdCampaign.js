const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdCampaignSchema = new Schema({
  advertiser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  budget: {
    type: Number,
    required: true,
    min: 0,
  },
  clicksCount: {
    type: Number,
    default: 0,
  },
  bannerUrl: {
    type: String,
    required: true,
  },
  redirectUrl: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('AdCampaign', AdCampaignSchema);
