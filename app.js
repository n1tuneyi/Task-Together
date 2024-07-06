const express = require("express");
const app = express();

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const authController = require("./Controller/authController");

const userRouter = require("./Routes/userRoutes");
const taskRouter = require("./Routes/taskRoutes");
const groupRouter = require("./Routes/groupRoutes");
const projectRouter = require("./Routes/projectRoutes");
const announcementRouter = require("./Routes/announcementRoutes");
const messageRouter = require("./Routes/messageRoutes");

const errorHandler = require("./Controller/errorController");

const cors = require("cors");

app.use(express.json());

app.use(cors());

app.get("/", (req, res, next) => {
  res.status(200).send(req.query);
});

// Authentication Routes
app.post("/login", authController.login);
app.post("/signup", authController.signup);

app.use("/users", userRouter);
app.use("/groups", groupRouter);
app.use("/projects", projectRouter);
app.use("/tasks", taskRouter);
app.use("/announcements", announcementRouter);
app.use("/messages", messageRouter);

app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `GET 404 ${req.originalUrl} Not Found`,
  });
});

module.exports = app;
