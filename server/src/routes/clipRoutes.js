import express from 'express';
import { createClip, getClips, likeClip, commentClip } from '../controllers/clipController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createClip)
  .get(protect, getClips);

router.post('/:id/like', protect, likeClip);
router.post('/:id/comment', protect, commentClip);

export default router;
