const { Server } = require('socket.io');

let io;
const onlineUsers = new Map();

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    socket.on('user_online', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    socket.on('join_community', (communityId) => {
      socket.join(`community_${communityId}`);
    });

    socket.on('leave_community', (communityId) => {
      socket.leave(`community_${communityId}`);
    });

    socket.on('join_crisis_hub', (hubId) => {
      socket.join(`crisis_${hubId}`);
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`🔌 User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

const getOnlineUsers = () => onlineUsers;

module.exports = { initSocket, getIO, getOnlineUsers };
