const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");

const server = http.createServer(app);

const { setupWebSocket } = require("./websocket");

process.on("uncaughtException", err => {
  console.log(err);
});

process.on("unhandledRejection", err => {
  console.log(err);
});

// Local DB
// const DB = process.env.DB_LOCAL;

// Remote DB
const DB = process.env.DB_REMOTE.replace("<PASSWORD>", process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection succcessful!"));

setupWebSocket(server);

const port = 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`App running on port ${port}...`);
});
