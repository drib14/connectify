import mongoose from 'mongoose';

const MomentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    media: {
      type: String, // Cloudinary URL
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    vibe: {
      title: { type: String, default: '' },
      artist: { type: String, default: '' },
      previewUrl: { type: String, default: '' },
      coverUrl: { type: String, default: '' },
    },
    caption: {
      type: String,
      default: '',
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      index: { expires: 0 }, // TTL Index: documents will delete automatically at expiresAt
    },
  },
  { timestamps: true }
);

export default mongoose.model('Moment', MomentSchema);
