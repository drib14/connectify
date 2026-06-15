import Moment from '../models/Moment.js';
import User from '../models/User.js';

export const createMoment = async (req, res) => {
  try {
    const { media, mediaType, vibe, caption } = req.body;

    if (!media) {
      return res.status(400).json({ message: 'Media URL is required for a Moment' });
    }

    const moment = await Moment.create({
      author: req.user._id,
      media,
      mediaType: mediaType || 'image',
      vibe: vibe || null,
      caption: caption || '',
    });

    const populatedMoment = await Moment.findById(moment._id).populate(
      'author',
      'username avatar isPremium'
    );

    res.status(201).json(populatedMoment);
  } catch (error) {
    console.error('Create Moment Error:', error.message);
    res.status(500).json({ message: 'Failed to upload Moment' });
  }
};

export const getMoments = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const authorIds = [req.user._id, ...user.circle];

    // Get active moments (TTL check happens automatically via MongoDB, but query expiresAt > now for absolute safety)
    const moments = await Moment.find({
      author: { $in: authorIds },
      expiresAt: { $gt: new Date() },
    })
      .populate('author', 'username avatar isPremium')
      .sort({ createdAt: -1 });

    res.json(moments);
  } catch (error) {
    console.error('Get Moments Error:', error.message);
    res.status(500).json({ message: 'Failed to load active Moments' });
  }
};
