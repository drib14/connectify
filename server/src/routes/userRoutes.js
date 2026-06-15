import express from 'express';
import {
  updateCanvas,
  getUserCanvas,
  sendCircleRequest,
  acceptCircleRequest,
  rejectCircleRequest,
  getCircleSuggestions,
  updateThought,
  getThoughts,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Canvas/Profile routes
router.put('/canvas', protect, updateCanvas);
router.get('/canvas/:username', protect, getUserCanvas);

// Circle (Friends) routes
router.post('/circle/request', protect, sendCircleRequest);
router.post('/circle/accept', protect, acceptCircleRequest);
router.post('/circle/reject', protect, rejectCircleRequest);
router.get('/circle/suggestions', protect, getCircleSuggestions);

// Thoughts (Notes) routes
router.put('/thought', protect, updateThought);
router.get('/thoughts', protect, getThoughts);

export default router;
