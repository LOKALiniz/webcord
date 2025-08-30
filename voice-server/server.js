const express = require('express');
const http = require('http');
const socket = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  socket.on('join-room', room => {
    socket.join(room);
    socket.to(room).emit('user-connected');
  });

  socket.on('offer', data => {
    socket.to(data.room).emit('offer', data);
  });

  socket.on('answer', data => {
    socket.to(data.room).emit('answer', data);
  });

  socket.on('ice-candidate', data => {
    socket.to(data.room).emit('ice-candidate', data);
  });

  socket.on('leave-room', room => {
    socket.leave(room);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
