const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const postController = require('../controllers/postController');
const { upload } = require('../utils/upload');

// Create post (supports text, poll or media)
router.post('/', auth, upload.single('media'), postController.createPost);

// Get Feed posts
router.get('/feed', auth, postController.getFeedPosts);

// Get profile posts
router.get('/user/:username', auth, postController.getUserPosts);

// Delete post
router.delete('/:postId', auth, postController.deletePost);

// React to post (Like/Love/Haha/etc)
router.post('/:postId/react', auth, postController.reactToPost);

// Add comment
router.post('/:postId/comment', auth, postController.addComment);

// Reply to a comment
router.post('/:postId/comment/:commentId/reply', auth, postController.replyToComment);

// Share / Repost post
router.post('/:postId/share', auth, postController.sharePost);

// Vote on a poll
router.post('/:postId/vote', auth, postController.votePoll);

module.exports = router;
