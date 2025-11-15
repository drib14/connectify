require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const http = require('http');
const { init, getIo } = require('./socket');

const app = express();
const server = http.createServer(app);
const io = init(server);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

// Routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/postRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Connectify Server is running!');
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
  });

  socket.on('joinRoom', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leaveRoom', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('sendMessage', (message) => {
    io.to(message.conversation).emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
