const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// @desc    Create a new conversation or get an existing one
// @route   POST /api/chat
// @access  Private
exports.createConversation = async (req, res) => {
  const { participants, isGroupChat, name } = req.body;

  if (!participants || participants.length === 0) {
    return res.status(400).json({ message: 'Participants are required' });
  }

  // Add the current user to the participants
  participants.push(req.user._id);

  try {
    if (isGroupChat) {
      // Create a new group chat
      const conversation = await Conversation.create({
        name,
        participants,
        isGroupChat: true,
        groupAdmins: [req.user._id],
      });
      res.status(201).json(conversation);
    } else {
      // Check if a one-on-one conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: participants },
        isGroupChat: false,
      });

      if (conversation) {
        res.json(conversation);
      } else {
        const newConversation = await Conversation.create({
          participants,
        });
        res.status(201).json(newConversation);
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all conversations for a user
// @route   GET /api/chat
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all messages for a conversation
// @route   GET /api/chat/:conversationId/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Send a new message
// @route   POST /api/chat/:conversationId/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  const { text, media, voice } = req.body;

  try {
    let mediaUrl = '';
    let voiceUrl = '';

    if (media) {
      const uploadedMedia = await cloudinary.uploader.upload(media, {
        folder: 'connectify/chat/media',
        resource_type: 'auto',
      });
      mediaUrl = uploadedMedia.secure_url;
    }

    if (voice) {
      const uploadedVoice = await cloudinary.uploader.upload(voice, {
        folder: 'connectify/chat/voice',
        resource_type: 'video', // Voice messages are often treated as video/audio
      });
      voiceUrl = uploadedVoice.secure_url;
    }

    const message = new Message({
      conversation: req.params.conversationId,
      sender: req.user._id,
      text,
      media: mediaUrl,
      voice: voiceUrl,
    });

    const createdMessage = await message.save();

    // Update the last message of the conversation
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: createdMessage._id,
    });

    // We'll emit the message via Socket.IO in the main server file
    res.status(201).json(createdMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
