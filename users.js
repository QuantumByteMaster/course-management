const express = require("express");
const { z } = require("zod");
const userRouter = express.Router();
const { UserModel, PurchaseModel } = require("./db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { userAuth } = require("./middlewares/userAuth");
require("dotenv").config();
const app = express();
app.use(express.json());

userRouter.post("/signup", async (req, res) => {
  const user = z.object({
    firstname: z.string().min(2).max(100),
    lastname: z.string().min(3).max(100),
    email: z.string(),
    password: z.string().min(6).max(75),
    username: z.string(),
  });
  const { firstname, lastname, email, password, username } = req.body;
  try {
    const inputCheck = user.safeParse(
      firstname,
      lastname,
      email,
      password,
      username
    );
    if (inputCheck) {
      const hashpassword = await bcrypt.hash(password, 5);
      const response = await UserModel.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hashpassword,
        username: username,
      });
      res.send({
        message: "you are succesfully signed up",
      });
    } else {
      return res.send({
        message: inputCheck.error.issues,
      });
    }
  } catch (e) {
    return res.json({
      error: inputCheck.error.issues,
    });
  }
});
userRouter.post("/signin", async (req, res) => {
  const user = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(75),
  });

  const { email, password } = req.body;

  try {
    const inputCheck = user.safeParse({ email, password });
    if (!inputCheck) {
      return res.status(400).send({
        error: "Invalid input",
      });
    }
    const userDet = await UserModel.findOne({ email: email });
    if (!userDet) {
      return res.status(404).send({
        message: "User not found. Check your credentials.",
      });
    }

    const verifyPassword = bcrypt.compare(password, userDet.password);
    if (!verifyPassword) {
      return res.status(401).send({
        message: "Wrong credentials",
      });
    }

    const token = jwt.sign(
      { id: userDet._id.toString() },
      process.env.JWT_SECRET_USER
    );

    res.status(200).send({
      message: "You are logged in",
      token: token,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send({
      message: "An internal server error occurred",
    });
  }
});
userRouter.get("/purchases", userAuth, async (req, res) => {
  const userId = req.id;
  const purchase = await PurchaseModel.find({
    userId: userId,
  });
  if (!purchase) {
    return res.send({
      message: "there are no purchases from your account",
    });
  }
});
userRouter.get("/user/course", userAuth, async (req, res) => {
  const user = z.object({
    email: z.email(),
    password: z.string().min(6).max(75),
  });
  const { email, password } = req.body;
  try {
    const inputCheck = user.parse(email, password);
    if (inputCheck) {
      const response = await UserModel.findOne({
        email: email,
      });
    } else {
      return res.send({
        message: inputCheck.error.issues,
      });
    }
  } catch (e) {
    return res.json({
      error: inputCheck.error.issues,
    });
  }
});

module.exports = {
  userRouter,
};
