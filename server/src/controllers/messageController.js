import Message from '../models/Message.js';
import User from '../models/User.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, media } = req.body;
    const senderId = req.user._id;

    if (!content && !media) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content || '',
      media: media || '',
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send Message Error:', error.message);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.user._id;

    // Get messages where sender is user and receiver is partner, OR vice versa
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: partnerId },
        { sender: partnerId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    // Mark partner's messages as read
    await Message.updateMany(
      { sender: partnerId, receiver: userId, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    console.error('Chat History Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve chat history' });
  }
};

export const getChatRooms = async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all users that the user has chatted with
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    }).sort({ createdAt: -1 });

    const partnerIds = new Set();
    messages.forEach((msg) => {
      if (msg.sender.toString() !== userId.toString()) partnerIds.add(msg.sender.toString());
      if (msg.receiver.toString() !== userId.toString()) partnerIds.add(msg.receiver.toString());
    });

    // Populate circle (friends) too, in case user wants to start a chat with someone in their circle who has no history yet
    const user = await User.findById(userId);
    user.circle.forEach((id) => partnerIds.add(id.toString()));

    const chatPartners = await User.find({ _id: { $in: Array.from(partnerIds) } }).select(
      'username avatar bio isPremium'
    );

    res.json(chatPartners);
  } catch (error) {
    console.error('Chat Rooms Error:', error.message);
    res.status(500).json({ message: 'Failed to retrieve conversational channels' });
  }
};
