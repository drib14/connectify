import express from 'express';
import { sendMessage, getChatHistory, getChatRooms } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/rooms', protect, getChatRooms);
router.get('/history/:partnerId', protect, getChatHistory);

export default router;
