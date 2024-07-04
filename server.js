const http = require("http");
const mongoose = require("mongoose");
const app = require("./app");
const cloudinary = require("cloudinary").v2;

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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

setupWebSocket(server);

const port = 3000;

server.listen(port, "0.0.0.0", () => {
  console.log(`App running on port ${port}...`);
});
