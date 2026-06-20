const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const { trackSparkProgress } = require('../utils/spark');

exports.getRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find({ participants: req.user.id })
      .populate('participants', 'username profilePic isPremium lastActive')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'username' }
      })
      .sort({ updatedAt: -1 });

    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { targetUserId, isGroup, groupName, participantsList } = req.body;

    if (isGroup) {
      if (!groupName || !participantsList || !Array.isArray(participantsList)) {
        return res.status(400).json({ success: false, message: 'Invalid group setup parameters' });
      }

      const allParticipants = [...new Set([req.user.id, ...participantsList])];
      const newRoom = new ChatRoom({
        name: groupName,
        isGroup: true,
        participants: allParticipants,
      });

      await newRoom.save();
      const populatedRoom = await ChatRoom.findById(newRoom._id)
        .populate('participants', 'username profilePic isPremium');

      return res.json({ success: true, room: populatedRoom });
    }

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required' });
    }

    let room = await ChatRoom.findOne({
      isGroup: false,
      participants: { $all: [req.user.id, targetUserId], $size: 2 }
    }).populate('participants', 'username profilePic isPremium lastActive');

    if (!room) {
      room = new ChatRoom({
        participants: [req.user.id, targetUserId],
        isGroup: false,
      });
      await room.save();
      room = await ChatRoom.findById(room._id).populate('participants', 'username profilePic isPremium lastActive');
    }

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatRoom: req.params.roomId })
      .populate('sender', 'username profilePic isPremium')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.postMessage = async (req, res) => {
  try {
    const { content, mediaUrl } = req.body;
    if (!content && !mediaUrl) {
      return res.status(400).json({ success: false, message: 'Message content is empty' });
    }

    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Chatroom not found' });
    }

    const newMessage = new Message({
      sender: req.user.id,
      content: content || '',
      mediaUrl: mediaUrl || '',
      chatRoom: req.params.roomId,
      readBy: [req.user.id],
    });

    await newMessage.save();

    room.lastMessage = newMessage._id;
    await room.save();

    await trackSparkProgress(req.user.id, 'message', req);

    const populatedMsg = await Message.findById(newMessage._id)
      .populate('sender', 'username profilePic isPremium');

    if (req.io && req.activeUsers) {
      room.participants.forEach(participantId => {
        if (participantId.toString() !== req.user.id) {
          const socketId = req.activeUsers.get(participantId.toString());
          if (socketId) {
            req.io.to(socketId).emit('message_received', {
              roomId: room._id,
              message: populatedMsg,
            });
          }
        }
      });
    }

    res.json({ success: true, message: populatedMsg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.aiChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let reply = "";
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('translate')) {
      reply = `🌐 **Connectify AI Translation**: \n\nI detect you want to translate a phrase. Here is a simulated translation of your request into English/Spanish/French:\n\n*"${message.replace(/translate/i, '').trim()}"* \n➔ *Translated: "Everything is connected under Connectify!"*`;
    } else if (lowerMsg.includes('summarize') || lowerMsg.includes('summary')) {
      reply = `📝 **Connectify AI Summary**: \n\nHere is a concise summary of the topic/text you mentioned:\n\n*This content highlights key connections between users, details premium subscriptions mechanisms, and logs geographical locations in real time. It encourages users to interact daily to win Spark points.*`;
    } else if (lowerMsg.includes('draft') || lowerMsg.includes('write')) {
      reply = `💡 **Connectify AI Post Draft**: \n\nHere's a premium draft you can publish to your feed:\n\n*"Just joined Connectify! Loving the Interactive Spaces map and competing for the Spark leaderboard top spot. Hit me up if you want to join a Co-Watching lounge tonight! 🚀🌟 #Connectify"*`;
    } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
      reply = `👋 **Hello! I am your Antigravity AI companion.**\n\nHow can I help you connect today? You can ask me to:\n- **Translate** phrases\n- **Summarize** long articles or posts\n- **Draft** status updates for your feed\n- Explain how Connectify features work!`;
    } else {
      reply = `🤖 **Antigravity AI Assistant**:\n\n"I hear you! As your social co-pilot, I'm here to write post drafts, summarize feed updates, translate chat messages, or discuss daily Spark challenges. What would you like to explore next?"`;
    }

    res.json({
      success: true,
      sender: { username: 'Antigravity AI', profilePic: '/ai-avatar.png', isPremium: true },
      content: reply,
      createdAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
