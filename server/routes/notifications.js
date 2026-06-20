const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

// Get user notifications
router.get('/', auth, notificationController.getNotifications);

// Mark all as read
router.put('/read', auth, notificationController.markAllRead);

// Mark single as read
router.put('/read/:notificationId', auth, notificationController.markSingleRead);

module.exports = router;
