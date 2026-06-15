import mongoose from 'mongoose';

const ClipSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    videoUrl: {
      type: String, // Cloudinary URL
      required: true,
    },
    caption: {
      type: String,
      default: '',
    },
    vibe: {
      title: { type: String, default: '' },
      artist: { type: String, default: '' },
      previewUrl: { type: String, default: '' },
      coverUrl: { type: String, default: '' },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Clip', ClipSchema);
