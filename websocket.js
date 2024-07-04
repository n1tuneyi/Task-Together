const app = require("./app");
const socket = require("socket.io");

const io = socket(app);

io.on("connection", socket => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("message", data => {
    console.log("message: ", data);
  });
});
