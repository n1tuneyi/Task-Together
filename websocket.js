const socketIo = require("socket.io");
const messageService = require("./Service/messageService");

let io;

function setupWebSocket(server) {
  io = socketIo(server);
  io.on("connection", socket => {
    console.log("A user connected");

    const token = socket.handshake.headers["authorization"];
    socket.token = token;
    
    socket.on("message", async msg => {
      // Broadcast the message to all connected clients except sender
      // socket.broadcast.emit("message", data);

      msg = JSON.parse(msg);

      const content = await messageService.sendMessage(msg.groupID, socket.token, msg.content);

      // // Broadcast the message to all clients including the sender
      io.emit(msg.groupID, content);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}

module.exports = { setupWebSocket, getIo: () => io };
