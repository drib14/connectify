require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// CORS options
const corsOptions = {
  origin: '*', // Allow all in development or configure specific URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io integration
const io = new Server(server, {
  cors: corsOptions,
});

// Map of userId -> socketId
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authenticate socket user
  socket.on('setup', (userId) => {
    socket.join(userId);
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} active on socket ${socket.id}`);
    io.emit('online_users', Array.from(activeUsers.keys()));
  });

  // Join chatroom
  socket.on('join_chat', (chatRoomId) => {
    socket.join(chatRoomId);
    console.log(`Socket ${socket.id} joined room ${chatRoomId}`);
  });

  // Handle typing indicator
  socket.on('typing', ({ chatRoomId, userId, username }) => {
    socket.to(chatRoomId).emit('typing', { userId, username });
  });
  socket.on('stop_typing', ({ chatRoomId, userId }) => {
    socket.to(chatRoomId).emit('stop_typing', { userId });
  });

  // Co-Watching Lounge synchronization
  socket.on('lounge_action', async ({ chatRoomId, action, videoUrl, time, isPlaying }) => {
    // action: 'load_video', 'play', 'pause', 'seek'
    // Update ChatRoom state in DB
    try {
      const ChatRoom = require('./models/ChatRoom');
      const updateData = {};
      if (videoUrl !== undefined) updateData.coWatchVideoUrl = videoUrl;
      if (time !== undefined) updateData.coWatchPlaybackTime = time;
      if (isPlaying !== undefined) updateData.coWatchIsPlaying = isPlaying;

      if (Object.keys(updateData).length > 0) {
        await ChatRoom.findByIdAndUpdate(chatRoomId, updateData);
      }

      // Broadcast changes to other users in the room
      socket.to(chatRoomId).emit('lounge_sync', {
        action,
        videoUrl,
        time,
        isPlaying,
      });
    } catch (err) {
      console.error('Co-watch sync error:', err);
    }
  });

  // Space Maps pin update
  socket.on('new_pin', (pinData) => {
    // PinData contains user, coordinates, status
    socket.broadcast.emit('pin_received', pinData);
  });

  socket.on('disconnect', () => {
    let disconnectedUserId = null;
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        activeUsers.delete(userId);
        break;
      }
    }
    console.log('Client disconnected:', socket.id);
    if (disconnectedUserId) {
      io.emit('online_users', Array.from(activeUsers.keys()));
    }
  });
});

// Attach io to request object to be accessible in express routes
app.use((req, res, next) => {
  req.io = io;
  req.activeUsers = activeUsers;
  next();
});

// MongoDB Connection
const connectDB = require('./config/db');
connectDB();

// Register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/spaces', require('./routes/spaces'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/marketplace', require('./routes/marketplace'));
app.use('/api/events', require('./routes/events'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/reels', require('./routes/reels'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/capsules', require('./routes/timeCapsules'));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Connectify Social Ecosystem Server API' });
});

// Error handling middleware
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
