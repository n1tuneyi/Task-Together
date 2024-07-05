const socketIo = require("socket.io");

const Message = require("./Model/messageModel");

let io;

function setupWebSocket(server) {
  io = socketIo(server);
  io.on("connection", socket => {
    console.log("A user connected");

    socket.on("message", message => {
      // console.log("Message received:", data);

      // Broadcast the message to all connected clients except sender
      // socket.broadcast.emit("message", data);
      message = JSON.parse(message);

      // Message.create({
      //   //   sender: message.sender,
      //   content: message.content,
      //   group: message.groupID,
      //   timestamp: Date.now(),
      // });
      // // Broadcast the message to all clients including the sender
      io.emit(message.groupID, message.content);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}

module.exports = { setupWebSocket, getIo: () => io };
