const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adController = require('../controllers/adController');
const { upload } = require('../utils/upload');

// Get random active ads
router.get('/active', auth, adController.getActiveAds);

// Get my ad campaigns
router.get('/my', auth, adController.getMyAds);

// Create Ad campaign (supports single banner upload to Cloudinary)
router.post('/', auth, upload.single('banner'), adController.createAd);

// Register Ad click
router.post('/click/:adId', auth, adController.registerClick);

module.exports = router;
