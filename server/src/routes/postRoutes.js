import express from 'express';
import {
  createPost,
  getPulseFeed,
  deletePost,
  reactPost,
  commentPost,
  sharePost,
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPost)
  .get(protect, getPulseFeed);

router.delete('/:id', protect, deletePost);
router.post('/:id/react', protect, reactPost);
router.post('/:id/comment', protect, commentPost);
router.post('/:id/share', protect, sharePost);

export default router;
