const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const messageController = require('../controllers/messageController');

// Get all user chatrooms
router.get('/rooms', auth, messageController.getRooms);

// Create/Fetch a direct room or group room
router.post('/room', auth, messageController.createRoom);

// Get room messages
router.get('/room/:roomId', auth, messageController.getMessages);

// Post a message in room
router.post('/room/:roomId', auth, messageController.postMessage);

// Antigravity AI Assistant chat
router.post('/ai-chat', auth, messageController.aiChat);

module.exports = router;
