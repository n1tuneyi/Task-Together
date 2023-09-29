const mongoose = require("mongoose");

const app = require("./app");

// Local DB
const DB = process.env.DB_LOCAL;

// Remote DB
// const DB = process.env.DB_REMOTE.replace("<PASSWORD>", process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB Connection succcessful!"));

const port = 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
