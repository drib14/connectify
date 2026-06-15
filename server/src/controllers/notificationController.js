import Notification from '../models/Notification.js';

export const createNotificationAndEmit = async (req, { recipient, type, post }) => {
  try {
    // Avoid notifying yourself
    if (req.user._id.toString() === recipient.toString()) return;

    const notification = await Notification.create({
      recipient,
      sender: req.user._id,
      type,
      post: post || null,
    });

    const populated = await Notification.findById(notification._id)
      .populate('sender', 'username avatar isPremium')
      .populate('post', 'content');

    const io = req.app.get('socketio');
    if (io) {
      io.to(recipient.toString()).emit('notification_received', populated);
    }
  } catch (error) {
    console.error('Create Notification Error:', error.message);
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username avatar isPremium')
      .populate('post', 'content')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Unauthorized action' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Mark Notification Read Error:', error.message);
    res.status(500).json({ message: 'Failed to update notification' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark All Read Error:', error.message);
    res.status(500).json({ message: 'Failed to update notifications' });
  }
};
