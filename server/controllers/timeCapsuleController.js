const TimeCapsule = require('../models/TimeCapsule');
const { uploadToCloudinary } = require('../utils/upload');
const User = require('../models/User');

// Create a new Time Capsule
exports.createTimeCapsule = async (req, res, next) => {
  try {
    const { title, message, unlockDate, participants } = req.body;

    if (!title || !message || !unlockDate) {
      return res.status(400).json({ success: false, message: 'Title, message, and unlock date are required.' });
    }

    const parsedUnlockDate = new Date(unlockDate);
    if (isNaN(parsedUnlockDate.getTime()) || parsedUnlockDate <= new Date()) {
      return res.status(400).json({ success: false, message: 'Unlock date must be in the future.' });
    }

    let mediaUrl = '';
    let mediaType = '';

    if (req.file) {
      const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';
      mediaUrl = await uploadToCloudinary(req.file.buffer, type);
      mediaType = type;
    }

    let parsedParticipants = [];
    if (participants) {
      try {
        parsedParticipants = typeof participants === 'string' ? JSON.parse(participants) : participants;
      } catch (e) {
        // Fallback if it is sent as comma separated list of IDs
        parsedParticipants = participants.split(',').map(id => id.trim());
      }
    }

    const newCapsule = new TimeCapsule({
      user: req.user.id,
      title,
      message,
      mediaUrl,
      mediaType,
      unlockDate: parsedUnlockDate,
      participants: parsedParticipants
    });

    await newCapsule.save();
    
    // Add reward points or progress challenge
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        user.sparkPoints += 25; // Create capsule bonus
        await user.save();
      }
    } catch (e) {}

    res.status(201).json({ success: true, capsule: newCapsule });
  } catch (err) {
    next(err);
  }
};

// Retrieve capsules related to the user (creator or participant)
exports.getTimeCapsules = async (req, res, next) => {
  try {
    const capsules = await TimeCapsule.find({
      $or: [
        { user: req.user.id },
        { participants: req.user.id }
      ]
    })
      .populate('user', 'username profilePic isPremium')
      .populate('participants', 'username profilePic')
      .sort({ unlockDate: 1 });

    const now = new Date();
    const sanitizedCapsules = capsules.map(c => {
      const isUnlocked = now >= c.unlockDate;
      if (!isUnlocked) {
        return {
          _id: c._id,
          user: c.user,
          title: c.title,
          unlockDate: c.unlockDate,
          participants: c.participants,
          createdAt: c.createdAt,
          isUnlocked: false,
          message: '🔒 Content is locked in the Connectify Vault.',
          mediaUrl: '',
          mediaType: ''
        };
      }
      return {
        _id: c._id,
        user: c.user,
        title: c.title,
        message: c.message,
        mediaUrl: c.mediaUrl,
        mediaType: c.mediaType,
        unlockDate: c.unlockDate,
        participants: c.participants,
        createdAt: c.createdAt,
        isUnlocked: true
      };
    });

    res.json({ success: true, capsules: sanitizedCapsules });
  } catch (err) {
    next(err);
  }
};

// Delete capsule (only creator can delete)
exports.deleteTimeCapsule = async (req, res, next) => {
  try {
    const capsule = await TimeCapsule.findById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ success: false, message: 'Time capsule not found.' });
    }

    if (capsule.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied. Only the creator can delete this capsule.' });
    }

    await capsule.deleteOne();
    res.json({ success: true, message: 'Time capsule deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
