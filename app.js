const express = require("express");
const app = express();

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const authController = require("./Controller/authController");

const userRouter = require("./Routes/userRoutes");
const taskRouter = require("./Routes/taskRoutes");
const groupRouter = require("./Routes/groupRoutes");

const errorHandler = require("./Controller/errorController");

app.use(express.json());

app.get("/", (req, res, next) => {
  res.status(200).send(req.query);
});

// Authentication Routes
app.post("/login", authController.login);
app.post("/signup", authController.signup);

app.use("/users", userRouter);
app.use("/groups", groupRouter);
app.use("/tasks", taskRouter);

app.use(errorHandler);

app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `GET 404 ${req.originalUrl} Not Found`,
  });
});

module.exports = app;
