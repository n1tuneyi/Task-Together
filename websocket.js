const socketIo = require("socket.io");

let io;

function setupWebSocket(server) {
  io = socketIo(server);
}

module.exports = { setupWebSocket, getIo: () => io };
