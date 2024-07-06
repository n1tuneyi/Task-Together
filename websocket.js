const socketIo = require("socket.io");
const messageService = require("./Service/messageService");
const authService = require("./Service/authService");

let io;

function setupWebSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "*", // Replace with your client URL or an array of URLs
      methods: ["GET", "POST"],
      allowedHeaders: ["Authorization"],
      credentials: true,
    },
  });
  io.on("connection", async socket => {
    console.log("A user connected");

    const token = socket.handshake.headers["authorization"];
    socket.token = token;

    // if socket is not valid, disconnect
    try {
      await authService.validateUser(token);
    } catch (err) {
      return socket.disconnect();
    }

    socket.on("message", async msg => {
      // Broadcast the message to all connected clients except sender
      // socket.broadcast.emit("message", data);

      msg = JSON.parse(msg);

      const content = await messageService.sendMessage(
        msg.groupID,
        socket.token,
        msg.content
      );

      // // Broadcast the message to all clients including the sender
      io.emit(msg.groupID, content);
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected");
    });
  });
}

module.exports = { setupWebSocket, getIo: () => io };
