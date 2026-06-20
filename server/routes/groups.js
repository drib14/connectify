const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const groupController = require('../controllers/groupController');

// Get all groups
router.get('/', auth, groupController.getGroups);

// Create group
router.post('/', auth, groupController.createGroup);

// Join group
router.post('/join/:groupId', auth, groupController.joinGroup);

// Leave group
router.post('/leave/:groupId', auth, groupController.leaveGroup);

// Get group posts
router.get('/:groupId/posts', auth, groupController.getGroupPosts);

// Post inside group
router.post('/:groupId/posts', auth, groupController.postInGroup);

module.exports = router;
