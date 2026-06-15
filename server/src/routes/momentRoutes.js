import express from 'express';
import { createMoment, getMoments } from '../controllers/momentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createMoment)
  .get(protect, getMoments);

export default router;
