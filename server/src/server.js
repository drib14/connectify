import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import connectDB from './config/db.js';
import { uploadToCloudinary } from './config/cloudinary.js';
import { protect } from './middleware/authMiddleware.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import momentRoutes from './routes/momentRoutes.js';
import clipRoutes from './routes/clipRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload Endpoint
const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const resourceType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    const result = await uploadToCloudinary(req.file.buffer, resourceType);
    res.json({ url: result.secure_url, type: resourceType });
  } catch (error) {
    console.error('File Upload Error:', error.message);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// Routing
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/moments', momentRoutes);
app.use('/api/clips', clipRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/integrations', integrationRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Connectify API is active...');
});

// Socket.io Setup
const activeUsers = {}; // Mapping of userId -> socket.id

io.on('connection', (socket) => {
  console.log('Socket client connected:', socket.id);

  socket.on('setup', (userData) => {
    if (userData && userData._id) {
      socket.join(userData._id);
      activeUsers[userData._id] = socket.id;
      io.emit('online_users', Object.keys(activeUsers));
      socket.emit('connected');
      console.log(`User ${userData.username} registered with socket.`);
    }
  });

  socket.on('join_chat', (room) => {
    socket.join(room);
    console.log('User joined room:', room);
  });

  socket.on('typing', (room) => {
    socket.in(room).emit('typing', room);
  });

  socket.on('stop_typing', (room) => {
    socket.in(room).emit('stop_typing', room);
  });

  socket.on('new_message', (msg) => {
    if (msg.receiver) {
      socket.in(msg.receiver).emit('message_received', msg);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket client disconnected:', socket.id);
    for (const [userId, socketId] of Object.entries(activeUsers)) {
      if (socketId === socket.id) {
        delete activeUsers[userId];
        break;
      }
    }
    io.emit('online_users', Object.keys(activeUsers));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in developer mode on port ${PORT}`);
});
