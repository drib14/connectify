const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  addReply,
  deleteReply,
  sharePost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createPost).get(protect, getPosts);
router
  .route('/:id')
  .put(protect, updatePost)
  .delete(protect, deletePost);
router.route('/:id/like').put(protect, likePost);
router.route('/:id/comment').post(protect, addComment);
router.route('/:id/comment/:comment_id').delete(protect, deleteComment);
router.route('/:id/comment/:comment_id/reply').post(protect, addReply);
router.route('/:id/comment/:comment_id/reply/:reply_id').delete(protect, deleteReply);
router.route('/:id/share').post(protect, sharePost);


module.exports = router;
