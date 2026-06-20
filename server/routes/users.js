const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');
const { upload } = require('../utils/upload');

// Search users
router.get('/search', auth, userController.searchUsers);

// Spark Leaderboard
router.get('/leaderboard', auth, userController.getLeaderboard);

// Daily Challenges Status
router.get('/challenges', auth, userController.getChallenges);

// Get profile details
router.get('/profile/:username', auth, userController.getProfile);

// Update profile (supports file upload to Cloudinary)
router.put('/profile', auth, upload.fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'coverPic', maxCount: 1 }
]), userController.updateProfile);

// Friend requests - Send
router.post('/friend-request/send/:userId', auth, userController.sendFriendRequest);

// Friend requests - Accept
router.post('/friend-request/accept/:senderId', auth, userController.acceptFriendRequest);

// Friend requests - Reject
router.post('/friend-request/reject/:senderId', auth, userController.rejectFriendRequest);

// Unfriend
router.post('/unfriend/:userId', auth, userController.unfriendUser);

// Follow
router.post('/follow/:userId', auth, userController.followUser);

// Unfollow
router.post('/unfollow/:userId', auth, userController.unfollowUser);

module.exports = router;
