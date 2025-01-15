const express = require("express");
const { userRouter } = require("./users");
const { adminRouter } = require("./admins");
const mongoose = require("mongoose");
const app = express();
const PORT = 3000;
require("dotenv").config();
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_CONNECT);
    console.log("Connected to databases");

    app.listen(PORT, () => {
      console.log(`Listening on Port ${PORT}`);
    });
  } catch (e) {
    console.log("failed to connect to this database", e);
  }
}
main();
