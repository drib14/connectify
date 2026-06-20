const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 30, unreadOnly } = req.query;
    const query = { recipient: req.user._id };
    if (unreadOnly === 'true') query.read = false;

    const notifications = await Notification.find(query)
      .populate('sender', 'firstName lastName username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: 'Notification deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead, deleteNotification };
