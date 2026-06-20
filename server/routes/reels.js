const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reelController = require('../controllers/reelController');
const { upload } = require('../utils/upload');

// Get all reels
router.get('/', auth, reelController.getReels);

// Create a reel (upload short video)
router.post('/', auth, upload.single('video'), reelController.createReel);

// Like / React to reel
router.post('/:reelId/react', auth, reelController.reactToReel);

// Add comment to reel
router.post('/:reelId/comment', auth, reelController.commentReel);

module.exports = router;
