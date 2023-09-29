const express = require("express");
const app = express();

const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const userController = require("./Controller/userController");

app.use(express.json());

if (process.env.NODE_ENV) app.use(morgan("dev"));

app.get("/", (req, res, next) => {});
app.get("/:param", (req, res, next) => {
  console.log(param);
});

app.post("/login", userController.login);

app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `GET 404 | ${req.url} Not Found`,
  });
});

module.exports = app;
