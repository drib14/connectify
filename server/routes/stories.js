const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const storyController = require('../controllers/storyController');
const { upload } = require('../utils/upload');

// Get all active stories
router.get('/', auth, storyController.getStories);

// Upload a story (supports single image upload to Cloudinary)
router.post('/', auth, upload.single('image'), storyController.createStory);

module.exports = router;
