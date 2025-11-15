const express = require('express');
const router = express.Router();
const {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
} = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createConversation).get(protect, getConversations);
router.route('/:conversationId/messages').get(protect, getMessages).post(protect, sendMessage);

module.exports = router;
