const express = require("express");
const app = express();

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const userController = require("./Controller/userController");
const taskController = require("./Controller/taskController");

app.use(express.json());

// if (process.env.NODE_ENV) app.use(morgan("dev"));

app.get("/", (req, res, next) => {
  res.status(200).send(req.query); // ?asdf=asdf&name=youssef&age=15
});

// app.get("/", (req, res, next) => {
//   console.log(req.params.param);
//   res.json({ message: req.params.param });
// });
app.post("/tasks", taskController.createTask);

app.post("/login", userController.login);

app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `GET 404 | ${req.url} Not Found`,
  });
});

module.exports = app;
