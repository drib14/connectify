import express from 'express';
import {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  createGroupPost,
  getGroupPosts,
} from '../controllers/groupController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createGroup)
  .get(protect, getAllGroups);

router.route('/:id')
  .get(protect, getGroupById);

router.post('/:id/join', protect, joinGroup);
router.post('/:id/posts', protect, createGroupPost);
router.get('/:id/posts', protect, getGroupPosts);

export default router;
