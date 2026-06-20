const Notification = require('../models/Notification');
const { getIO, getOnlineUsers } = require('../config/socket');

const createAndSendNotification = async ({ recipient, sender, type, message, link, metadata }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      link,
      metadata,
    });

    // Populate sender details for the client
    const populated = await notification.populate('sender', 'firstName lastName username avatar');

    // Attempt to push real-time socket notification
    try {
      const io = getIO();
      const onlineUsers = getOnlineUsers();
      const socketId = onlineUsers.get(recipient.toString());
      if (socketId) {
        io.to(socketId).emit('new_notification', populated);
      }
    } catch (socketError) {
      // Suppress socket error if it's not initialized
    }

    return populated;
  } catch (error) {
    console.error('Failed to create/send notification:', error);
    throw error;
  }
};

module.exports = { createAndSendNotification };
