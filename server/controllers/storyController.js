const Story = require('../models/Story');
const { uploadToCloudinary } = require('../utils/upload');

exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('user', 'username profilePic isPremium')
      .sort({ createdAt: -1 });

    res.json({ success: true, stories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Story image file is required' });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'image');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newStory = new Story({
      user: req.user.id,
      mediaUrl: imageUrl,
      mediaType: 'image',
      expiresAt
    });

    await newStory.save();
    const populated = await Story.findById(newStory._id)
      .populate('user', 'username profilePic isPremium');

    res.status(201).json({ success: true, story: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
