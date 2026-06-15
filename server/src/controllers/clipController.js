import Clip from '../models/Clip.js';

export const createClip = async (req, res) => {
  try {
    const { videoUrl, caption, vibe } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: 'Video URL is required for a Clip' });
    }

    const clip = await Clip.create({
      author: req.user._id,
      videoUrl,
      caption: caption || '',
      vibe: vibe || null,
    });

    const populatedClip = await Clip.findById(clip._id)
      .populate('author', 'username avatar isPremium')
      .populate('comments.author', 'username avatar isPremium');

    res.status(201).json(populatedClip);
  } catch (error) {
    console.error('Create Clip Error:', error.message);
    res.status(500).json({ message: 'Failed to upload Clip' });
  }
};

export const getClips = async (req, res) => {
  try {
    const clips = await Clip.find()
      .populate('author', 'username avatar isPremium')
      .populate('comments.author', 'username avatar isPremium')
      .sort({ createdAt: -1 });

    res.json(clips);
  } catch (error) {
    console.error('Get Clips Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve Clips' });
  }
};

export const likeClip = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const clip = await Clip.findById(id);
    if (!clip) {
      return res.status(404).json({ message: 'Clip not found' });
    }

    const index = clip.likes.indexOf(userId);
    if (index > -1) {
      // Unlike
      clip.likes.splice(index, 1);
    } else {
      // Like
      clip.likes.push(userId);
    }

    await clip.save();
    
    const updatedClip = await Clip.findById(id)
      .populate('author', 'username avatar isPremium')
      .populate('comments.author', 'username avatar isPremium');

    res.json(updatedClip);
  } catch (error) {
    console.error('Like Clip Error:', error.message);
    res.status(500).json({ message: 'Failed to register like' });
  }
};

export const commentClip = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Comment text cannot be empty' });
    }

    const clip = await Clip.findById(id);
    if (!clip) {
      return res.status(404).json({ message: 'Clip not found' });
    }

    clip.comments.push({
      author: req.user._id,
      text,
    });

    await clip.save();

    const updatedClip = await Clip.findById(id)
      .populate('author', 'username avatar isPremium')
      .populate('comments.author', 'username avatar isPremium');

    res.json(updatedClip);
  } catch (error) {
    console.error('Comment Clip Error:', error.message);
    res.status(500).json({ message: 'Failed to post comment' });
  }
};
