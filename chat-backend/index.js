const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const Message = require('./models/Message');
const messageRoutes = require('./routes/messages');

dotenv.config();

const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
app.use(express.json());

const users = {};           
const userSockets = {};     

app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
  res.send('Socket.io Chat Server Running');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('new-user', (username) => {
    users[socket.id] = username;
    userSockets[username] = socket.id;
      console.log(`📥 Received new-user: ${username} from ${socket.id}`);
    console.log('📤 Emitting user-list:', Object.values(users)); 

    io.emit('user-list', Object.values(users));

    io.emit('chat-message', {
      username: 'System',
      message: `${username} has joined the chat.`,
      timestamp: new Date().toLocaleTimeString(),
      system: true,
    });
  });

socket.on('chat-message', async (data, callback) => {
  const { from, message, timestamp } = data;

  const msg = new Message({
    from,
    to: null,
    message,
    timestamp: timestamp || new Date().toLocaleTimeString(),
    isPrivate: false,
  });

  try {
    await msg.save();
    console.log("📨 Global chat message saved:", msg);
    io.emit('chat-message', data);
    callback?.({ status: 'ok' });
  } catch (error) {
    console.error('❌ Failed to save global message:', error);
    callback?.({ status: 'error', error: error.message });
  }
});


socket.on('private-message', async ({ to, from, message }) => {
  const timestamp = new Date().toLocaleTimeString();
  const newMsg = new Message({ from, to, message,timestamp: timestamp || new Date().toLocaleTimeString(),
    isPrivate: true, });
    
  await newMsg.save();

  const targetSocketId = userSockets[to];
  if (targetSocketId) {
    io.to(targetSocketId).emit('private-message', { from, message, timestamp });
    socket.emit('private-message', { from, message, timestamp, self: true });
  }
});

  socket.on('user-typing', (username) => {
    socket.broadcast.emit('user-typing', username);
  });

  socket.on('stop-typing', (username) => {
    socket.broadcast.emit('stop-typing', username);
  });

  socket.on('disconnect', () => {
  const username = users[socket.id];

  if (username) {
    delete userSockets[username];
    delete users[socket.id];

    io.emit('user-list', Object.values(users));

    io.emit('chat-message', {
      username: 'System',
      message: `${username} has left the chat.`,
      timestamp: new Date().toLocaleTimeString(),
      system: true,
    });
  }
});

});


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true})
  .then(() => {
    server.listen(process.env.PORT, () => {
      console.log('✅ Server running on port', process.env.PORT);
    });
  })
  .catch((err) => console.error('MongoDB error:', err));
