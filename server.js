const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// For Flutter login
app.post('/store', (req, res) => {
  res.status(200).send({ status: "success" });
});

const users = {}; // Stores { "username": "socket_id" }

io.on('connection', (socket) => {
  // Save user when they log in
  socket.on('register_user', (userId) => {
    users[userId] = socket.id;
    console.log(`${userId} is now online`);
  });

  // Relay message from one user to another
  socket.on('send_message', (data) => {
    const receiverId = users[data.to];
    if (receiverId) {
      io.to(receiverId).emit('receive_message', data);
    }
  });

  socket.on('disconnect', () => {
    // Remove user from memory on disconnect
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
