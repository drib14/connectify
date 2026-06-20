const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createPost, getFeed, getPost, toggleLike, addComment,
  toggleBookmark, requestFactCheck, deletePost, getUserPosts,
  addCommentReply, tipPost, tipComment,
} = require('../controllers/postController');

const router = express.Router();

router.get('/feed', optionalAuth, getFeed);
router.get('/user/:username', getUserPosts);
router.get('/:id', optionalAuth, getPost);

router.post('/', auth, upload.fields([{ name: 'postMedia', maxCount: 10 }]), createPost);
router.post('/:id/like', auth, toggleLike);
router.post('/:id/comment', auth, addComment);
router.post('/:id/comments/:commentId/replies', auth, addCommentReply);
router.post('/:id/tip', auth, tipPost);
router.post('/:id/comments/:commentId/tip', auth, tipComment);
router.post('/:id/bookmark', auth, toggleBookmark);
router.post('/:id/fact-check', auth, requestFactCheck);
router.delete('/:id', auth, deletePost);

module.exports = router;
