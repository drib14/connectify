const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -refreshToken -verificationToken')
      .populate('trustCircles.family', 'firstName lastName username avatar')
      .populate('trustCircles.friends', 'firstName lastName username avatar')
      .populate('trustCircles.coworkers', 'firstName lastName username avatar')
      .populate('trustCircles.classmates', 'firstName lastName username avatar')
      .populate('accountabilityPartner', 'firstName lastName username avatar');

    if (!user) return res.status(404).json({ message: 'User not found.' });
    
    const postCount = await Post.countDocuments({ author: user._id, isAnonymous: false });
    const followerCount = user.followers?.length || 0;
    const followingCount = user.following?.length || 0;

    res.json({ ...user.toJSON(), postCount, followerCount, followingCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'bio', 'location', 'website', 'skills', 'likeFreeModeEnabled', 'slowFeedEnabled', 'feedRefreshLimit', 'currentMood', 'followingTopics'];
    const updates = {};
    
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (req.files?.avatar) updates.avatar = req.files.avatar[0].path;
    if (req.files?.coverPhoto) updates.coverPhoto = req.files.coverPhoto[0].path;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('-password -refreshToken');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update trust circles
const updateTrustCircles = async (req, res) => {
  try {
    const { circle, userId, action } = req.body;
    const validCircles = ['family', 'friends', 'coworkers', 'classmates'];
    
    if (!validCircles.includes(circle)) {
      return res.status(400).json({ message: 'Invalid trust circle.' });
    }

    const update = action === 'add'
      ? { $addToSet: { [`trustCircles.${circle}`]: userId } }
      : { $pull: { [`trustCircles.${circle}`]: userId } };

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true })
      .select('-password -refreshToken')
      .populate(`trustCircles.${circle}`, 'firstName lastName username avatar');

    if (action === 'add') {
      await Notification.create({
        recipient: userId,
        sender: req.user._id,
        type: 'trustCircleAdd',
        message: `${req.user.firstName} added you to their ${circle} circle.`,
        link: `/profile/${req.user.username}`,
      });
    }

    res.json(user.trustCircles);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Follow / Unfollow
const toggleFollow = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });
    if (targetUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    const isFollowing = req.user.following.includes(targetUser._id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: targetUser._id } });
      await User.findByIdAndUpdate(targetUser._id, { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: targetUser._id } });
      await User.findByIdAndUpdate(targetUser._id, { $addToSet: { followers: req.user._id } });
      
      await Notification.create({
        recipient: targetUser._id,
        sender: req.user._id,
        type: 'follow',
        message: `${req.user.firstName} ${req.user.lastName} started following you.`,
        link: `/profile/${req.user.username}`,
      });
    }

    res.json({ following: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Skill Showcase (Feature #18)
const updateSkillShowcase = async (req, res) => {
  try {
    const { title, description, link, tags } = req.body;
    const media = req.files?.showcaseMedia?.map(f => f.path) || [];

    const showcaseItem = { title, description, media, link, tags: tags ? JSON.parse(tags) : [] };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { skillShowcase: showcaseItem } },
      { new: true }
    ).select('skillShowcase');

    // Increase contribution score
    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 5 } });

    res.json(user.skillShowcase);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete skill showcase item
const deleteSkillShowcase = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { skillShowcase: { _id: req.params.itemId } } },
      { new: true }
    ).select('skillShowcase');

    res.json(user.skillShowcase);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Accountability Partner (Feature #30)
const requestAccountabilityPartner = async (req, res) => {
  try {
    const { partnerId } = req.body;
    const partner = await User.findById(partnerId);
    if (!partner) return res.status(404).json({ message: 'User not found.' });

    await User.findByIdAndUpdate(partnerId, {
      $push: {
        accountabilityRequests: { from: req.user._id, status: 'pending' },
      },
    });

    await Notification.create({
      recipient: partnerId,
      sender: req.user._id,
      type: 'partnerRequest',
      message: `${req.user.firstName} wants to be your accountability partner!`,
      link: `/profile/${req.user.username}`,
    });

    res.json({ message: 'Accountability partner request sent.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Respond to accountability request
const respondAccountabilityRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const user = await User.findById(req.user._id);
    const request = user.accountabilityRequests.id(requestId);
    
    if (!request) return res.status(404).json({ message: 'Request not found.' });

    request.status = action === 'accept' ? 'accepted' : 'declined';

    if (action === 'accept') {
      user.accountabilityPartner = request.from;
      await User.findByIdAndUpdate(request.from, { accountabilityPartner: req.user._id });
    }

    await user.save();
    res.json({ message: `Request ${action}ed.` });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Digital Legacy (Feature #5)
const updateDigitalLegacy = async (req, res) => {
  try {
    const { action, trustedContact, message } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { digitalLegacy: { enabled: true, action, trustedContact, message } },
      { new: true }
    ).select('digitalLegacy');

    res.json(user.digitalLegacy);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Privacy Dashboard (Feature #4)
const getPrivacyDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('trustCircles disposableProfiles digitalLegacy likeFreeModeEnabled slowFeedEnabled socialBurnoutSettings');
    
    const postsByVisibility = await Post.aggregate([
      { $match: { author: user._id } },
      { $group: { _id: '$visibility', count: { $sum: 1 } } },
    ]);

    res.json({
      trustCircles: {
        family: user.trustCircles.family.length,
        friends: user.trustCircles.friends.length,
        coworkers: user.trustCircles.coworkers.length,
        classmates: user.trustCircles.classmates.length,
      },
      disposableProfiles: user.disposableProfiles.length,
      digitalLegacy: user.digitalLegacy,
      privacySettings: {
        likeFreeModeEnabled: user.likeFreeModeEnabled,
        slowFeedEnabled: user.slowFeedEnabled,
        socialBurnoutSettings: user.socialBurnoutSettings,
      },
      postsByVisibility,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const users = await User.find({
      $or: [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ],
    })
      .select('firstName lastName username avatar bio contributionScore skills')
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get suggested users
const getSuggestedUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const excludeIds = [
      req.user._id,
      ...currentUser.following,
      ...currentUser.trustCircles.family,
      ...currentUser.trustCircles.friends,
      ...currentUser.trustCircles.coworkers,
      ...currentUser.trustCircles.classmates,
    ];

    const users = await User.find({ _id: { $nin: excludeIds } })
      .select('firstName lastName username avatar bio contributionScore skills')
      .sort({ contributionScore: -1 })
      .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Disposable Profile (Feature #3)
const createDisposableProfile = async (req, res) => {
  try {
    const { displayName, communityId, expiresInDays } = req.body;
    const expiresAt = new Date(Date.now() + (expiresInDays || 30) * 24 * 60 * 60 * 1000);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { disposableProfiles: { displayName, communityId, expiresAt } } },
      { new: true }
    ).select('disposableProfiles');

    res.json(user.disposableProfiles);
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Social Burnout Detection (Feature #7)
const updateUsageTime = async (req, res) => {
  try {
    const { minutes } = req.body;
    const user = await User.findById(req.user._id);
    
    const today = new Date().toDateString();
    const lastReset = new Date(user.socialBurnoutSettings.lastResetDate).toDateString();
    
    if (today !== lastReset) {
      user.socialBurnoutSettings.todayUsageMinutes = 0;
      user.socialBurnoutSettings.lastResetDate = new Date();
    }

    user.socialBurnoutSettings.todayUsageMinutes += minutes;
    await user.save();

    const { dailyLimitMinutes, todayUsageMinutes, breakReminderMinutes } = user.socialBurnoutSettings;
    const warnings = [];

    if (todayUsageMinutes >= dailyLimitMinutes) {
      warnings.push({ type: 'limit_reached', message: "You've reached your daily usage limit. Consider taking a break! 🌿" });
    } else if (todayUsageMinutes >= dailyLimitMinutes * 0.8) {
      warnings.push({ type: 'approaching_limit', message: "You're approaching your daily usage limit." });
    }

    if (todayUsageMinutes % breakReminderMinutes < minutes) {
      warnings.push({ type: 'break_reminder', message: "Time for a break! Step away and stretch. 🧘" });
    }

    res.json({ todayUsageMinutes, dailyLimitMinutes, warnings });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = {
  getProfile, updateProfile, updateTrustCircles, toggleFollow,
  updateSkillShowcase, deleteSkillShowcase,
  requestAccountabilityPartner, respondAccountabilityRequest,
  updateDigitalLegacy, getPrivacyDashboard,
  searchUsers, getSuggestedUsers, createDisposableProfile,
  updateUsageTime,
};
