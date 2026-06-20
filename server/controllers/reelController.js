const Reel = require('../models/Reel');
const { uploadToCloudinary } = require('../utils/upload');

exports.getReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate('user', 'username profilePic isPremium')
      .populate('comments.user', 'username profilePic isPremium')
      .sort({ createdAt: -1 });

    res.json({ success: true, reels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createReel = async (req, res) => {
  try {
    const { caption } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Video file is required' });
    }

    const videoUrl = await uploadToCloudinary(req.file.buffer, 'video');

    const newReel = new Reel({
      user: req.user.id,
      videoUrl,
      caption: caption || '',
      likes: [],
      comments: []
    });

    await newReel.save();
    const populated = await Reel.findById(newReel._id)
      .populate('user', 'username profilePic isPremium');

    res.status(201).json({ success: true, reel: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.reactToReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.reelId);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const hasLiked = reel.likes.includes(req.user.id);
    if (hasLiked) {
      reel.likes = reel.likes.filter(id => id.toString() !== req.user.id);
    } else {
      reel.likes.push(req.user.id);
    }

    await reel.save();
    res.json({ success: true, likes: reel.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.commentReel = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }

    const reel = await Reel.findById(req.params.reelId);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    const newComment = {
      user: req.user.id,
      text,
      createdAt: new Date()
    };

    reel.comments.push(newComment);
    await reel.save();

    const populatedReel = await Reel.findById(reel._id)
      .populate('comments.user', 'username profilePic isPremium');
    
    res.json({ success: true, comment: populatedReel.comments[populatedReel.comments.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
