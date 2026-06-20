const User = require('../models/User');
const Notification = require('../models/Notification');
const { uploadToCloudinary } = require('../utils/upload');
const { checkAndResetChallenges } = require('../utils/spark');

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ success: true, users: [] });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('username email profilePic bio isPremium sparkPoints').limit(20);

    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .sort({ sparkPoints: -1 })
      .limit(10)
      .select('username profilePic sparkPoints isPremium');
    
    res.json({ success: true, leaderboard: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getChallenges = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isReset = checkAndResetChallenges(user);
    if (isReset) {
      await user.save();
    }

    res.json({
      success: true,
      dailyChallenges: user.dailyChallenges,
      sparkPoints: user.sparkPoints,
      isPremium: user.isPremium,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('friends', 'username profilePic bio isPremium sparkPoints');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    if (req.files && req.files['profilePic']) {
      const picFile = req.files['profilePic'][0];
      const imageUrl = await uploadToCloudinary(picFile.buffer, 'image');
      user.profilePic = imageUrl;
    }

    if (req.files && req.files['coverPic']) {
      const coverFile = req.files['coverPic'][0];
      const imageUrl = await uploadToCloudinary(coverFile.buffer, 'image');
      user.coverPic = imageUrl;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        coverPic: user.coverPic,
        bio: user.bio,
        isPremium: user.isPremium,
        sparkPoints: user.sparkPoints,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const recipientId = req.params.userId;
    const senderId = req.user.id;

    if (recipientId === senderId) {
      return res.status(400).json({ success: false, message: 'Cannot send request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (sender.friends.includes(recipientId)) {
      return res.status(400).json({ success: false, message: 'Already friends' });
    }

    const alreadyRequested = recipient.friendRequests.some(r => r.sender.toString() === senderId && r.status === 'pending');
    if (alreadyRequested) {
      return res.status(400).json({ success: false, message: 'Friend request already sent' });
    }

    recipient.friendRequests.push({ sender: senderId, status: 'pending' });
    await recipient.save();

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type: 'friend_request',
      content: `${sender.username} sent you a friend request.`,
    });
    await notification.save();

    if (req.io && req.activeUsers) {
      const socketId = req.activeUsers.get(recipientId);
      if (socketId) {
        req.io.to(socketId).emit('notification_received', {
          id: notification._id,
          sender: { id: sender._id, username: sender.username, profilePic: sender.profilePic },
          type: 'friend_request',
          content: notification.content,
          isRead: false,
          createdAt: notification.createdAt,
        });
      }
    }

    res.json({ success: true, message: 'Friend request sent!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const recipientId = req.user.id;

    const recipient = await User.findById(recipientId);
    const sender = await User.findById(senderId);

    if (!recipient || !sender) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const requestIndex = recipient.friendRequests.findIndex(
      r => r.sender.toString() === senderId && r.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(400).json({ success: false, message: 'No pending friend request found' });
    }

    recipient.friendRequests[requestIndex].status = 'accepted';
    recipient.friends.push(senderId);
    sender.friends.push(recipientId);

    if (!recipient.following.includes(senderId)) recipient.following.push(senderId);
    if (!recipient.followers.includes(senderId)) recipient.followers.push(senderId);
    if (!sender.following.includes(recipientId)) sender.following.push(recipientId);
    if (!sender.followers.includes(recipientId)) sender.followers.push(recipientId);

    await recipient.save();
    await sender.save();

    const notification = new Notification({
      recipient: senderId,
      sender: recipientId,
      type: 'friend_accept',
      content: `${recipient.username} accepted your friend request.`,
    });
    await notification.save();

    if (req.io && req.activeUsers) {
      const socketId = req.activeUsers.get(senderId);
      if (socketId) {
        req.io.to(socketId).emit('notification_received', {
          id: notification._id,
          sender: { id: recipient._id, username: recipient.username, profilePic: recipient.profilePic },
          type: 'friend_accept',
          content: notification.content,
          isRead: false,
          createdAt: notification.createdAt,
        });
      }
    }

    res.json({ success: true, message: 'Friend request accepted!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rejectFriendRequest = async (req, res) => {
  try {
    const senderId = req.params.senderId;
    const recipientId = req.user.id;

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const requestIndex = recipient.friendRequests.findIndex(
      r => r.sender.toString() === senderId && r.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(400).json({ success: false, message: 'No pending friend request found' });
    }

    recipient.friendRequests[requestIndex].status = 'rejected';
    await recipient.save();

    res.json({ success: true, message: 'Friend request rejected.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unfriendUser = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentId = req.user.id;

    const currentUser = await User.findById(currentId);
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    currentUser.friends = currentUser.friends.filter(id => id.toString() !== targetId);
    targetUser.friends = targetUser.friends.filter(id => id.toString() !== currentId);

    currentUser.following = currentUser.following.filter(id => id.toString() !== targetId);
    currentUser.followers = currentUser.followers.filter(id => id.toString() !== targetId);
    targetUser.following = targetUser.following.filter(id => id.toString() !== currentId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentId);

    await currentUser.save();
    await targetUser.save();

    res.json({ success: true, message: 'Unfriended successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentId = req.user.id;

    if (targetId === currentId) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const currentUser = await User.findById(currentId);
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (currentUser.following.includes(targetId)) {
      return res.status(400).json({ success: false, message: 'Already following this user' });
    }

    currentUser.following.push(targetId);
    targetUser.followers.push(currentId);

    await currentUser.save();
    await targetUser.save();

    res.json({ success: true, message: 'Followed user.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.userId;
    const currentId = req.user.id;

    const currentUser = await User.findById(currentId);
    const targetUser = await User.findById(targetId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== targetId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentId);

    await currentUser.save();
    await targetUser.save();

    res.json({ success: true, message: 'Unfollowed user.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
