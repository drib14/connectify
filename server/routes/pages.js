const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const pageController = require('../controllers/pageController');

// Get all pages
router.get('/', auth, pageController.getPages);

// Create page
router.post('/', auth, pageController.createPage);

// Follow page
router.post('/follow/:pageId', auth, pageController.followPage);

// Get page posts
router.get('/:pageId/posts', auth, pageController.getPagePosts);

// Post inside page
router.post('/:pageId/posts', auth, pageController.postInPage);

module.exports = router;
