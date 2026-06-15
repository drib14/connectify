import User from '../models/User.js';

// CANVAS PROFILE ACTIONS
export const updateCanvas = async (req, res) => {
  try {
    const { bio, avatar, banner, vibeSong } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (banner !== undefined) user.banner = banner;
    if (vibeSong !== undefined) user.vibeSong = vibeSong;

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      banner: updatedUser.banner,
      bio: updatedUser.bio,
      vibeSong: updatedUser.vibeSong,
      isPremium: updatedUser.isPremium,
    });
  } catch (error) {
    console.error('Update Canvas Error:', error.message);
    res.status(500).json({ message: 'Failed to update Canvas profile' });
  }
};

export const getUserCanvas = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username })
      .select('-password')
      .populate('circle', 'username avatar isPremium');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get Canvas Error:', error.message);
    res.status(500).json({ message: 'Failed to load Canvas profile' });
  }
};

// CIRCLE (FRIENDS) ACTIONS
export const sendCircleRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const senderId = req.user._id;

    if (senderId.toString() === targetUserId) {
      return res.status(400).json({ message: 'Cannot add yourself to your circle' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target user not found' });
    }

    // Check if already in circle or request pending
    if (targetUser.circle.includes(senderId)) {
      return res.status(400).json({ message: 'User is already in your Circle' });
    }
    if (targetUser.circleRequests.includes(senderId)) {
      return res.status(400).json({ message: 'Circle request already pending' });
    }

    targetUser.circleRequests.push(senderId);
    await targetUser.save();

    res.json({ message: 'Circle request sent successfully' });
  } catch (error) {
    console.error('Circle Request Error:', error.message);
    res.status(500).json({ message: 'Failed to send circle request' });
  }
};

export const acceptCircleRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);

    if (!user || !requester) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.circleRequests.includes(requesterId)) {
      return res.status(400).json({ message: 'No pending circle request from this user' });
    }

    // Remove from request list, add to circles for both users
    user.circleRequests = user.circleRequests.filter((id) => id.toString() !== requesterId);
    if (!user.circle.includes(requesterId)) {
      user.circle.push(requesterId);
    }
    if (!requester.circle.includes(userId)) {
      requester.circle.push(userId);
    }

    await user.save();
    await requester.save();

    res.json({ message: 'Circle request accepted' });
  } catch (error) {
    console.error('Accept Request Error:', error.message);
    res.status(500).json({ message: 'Failed to accept circle request' });
  }
};

export const rejectCircleRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.circleRequests = user.circleRequests.filter((id) => id.toString() !== requesterId);
    await user.save();

    res.json({ message: 'Circle request declined' });
  } catch (error) {
    console.error('Decline Request Error:', error.message);
    res.status(500).json({ message: 'Failed to decline circle request' });
  }
};

export const getCircleSuggestions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const excludeIds = [req.user._id, ...user.circle, ...user.circleRequests];

    const suggestions = await User.find({ _id: { $nin: excludeIds } })
      .select('username avatar bio isPremium')
      .limit(10);

    res.json(suggestions);
  } catch (error) {
    console.error('Circle Suggestions Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve connection suggestions' });
  }
};

// THOUGHTS (NOTES) ACTIONS
export const updateThought = async (req, res) => {
  try {
    const { text, vibe } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.thought = {
      text: text || '',
      expiresAt: text ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null, // 24 hours
      vibe: vibe || { title: '', artist: '', previewUrl: '' },
    };

    await user.save();
    res.json(user.thought);
  } catch (error) {
    console.error('Update Thought Error:', error.message);
    res.status(500).json({ message: 'Failed to update Thought bubble' });
  }
};

export const getThoughts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Find active thoughts of user and user's circle (friends)
    const userIds = [req.user._id, ...user.circle];
    
    const activeUsers = await User.find({
      _id: { $in: userIds },
      'thought.text': { $ne: '' },
      'thought.expiresAt': { $gt: new Date() },
    }).select('username avatar thought');

    res.json(activeUsers);
  } catch (error) {
    console.error('Get Thoughts Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve thoughts' });
  }
};
