const socketIo = require("socket.io");
const messageService = require("./Service/messageService");

let io;

function setupWebSocket(server) {
  io = socketIo(server);
  io.on("connection", socket => {
    console.log("A user connected");

    socket.on("message", async message => {
      // Broadcast the message to all connected clients except sender
      // socket.broadcast.emit("message", data);

      message = JSON.parse(message);

      await messageService.sendMessage(message);

      // // Broadcast the message to all clients including the sender
      io.emit(message.groupID, message.content);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}

module.exports = { setupWebSocket, getIo: () => io };
