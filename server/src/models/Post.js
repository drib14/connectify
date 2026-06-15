import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
      },
    ],
    location: {
      name: { type: String, default: '' },
      lat: { type: Number },
      lon: { type: Number },
    },
    vibe: {
      title: { type: String, default: '' },
      artist: { type: String, default: '' },
      previewUrl: { type: String, default: '' },
      coverUrl: { type: String, default: '' },
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, enum: ['Like', 'Love', 'Fire', 'Vibe', 'Haha'], default: 'Like' },
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

export default mongoose.model('Post', PostSchema);
