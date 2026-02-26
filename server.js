const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const rooms = {};
app.use(express.static(__dirname));
io.on("connection", (socket) => {

  socket.on("join-room", ({ roomId, username }) => {

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    if (rooms[roomId].length >= 2) {
      socket.emit("room-full");
      return;
    }

    rooms[roomId].push(socket.id);
    socket.join(roomId);

    io.to(roomId).emit("user-count", rooms[roomId].length);

    socket.on("send-message", (message) => {
  io.to(roomId).emit("receive-message", {
    user: username,
    text: message
  });
});

    socket.on("disconnect", () => {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      } else {
        io.to(roomId).emit("user-count", rooms[roomId].length);
      }
    });

  });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
