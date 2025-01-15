const express = require("express");
const { z } = require("zod");
const adminRouter = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { AdminModel, CourseModel } = require("./db");
const { adminAuth } = require("./middlewares/adminAuth");
require("dotenv").config();
const app = express();
app.use(express.json());

adminRouter.post("/signup", async (req, res) => {
  const admin = z.object({
    firstname: z.string().min(2).max(100),
    lastname: z.string().min(3).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(75),
    username: z.string(),
  });

  const { firstname, lastname, email, password, username } = req.body;

  try {
    const inputCheck = admin.safeParse({
      firstname,
      lastname,
      email,
      password,
      username,
    });
    if (!inputCheck) {
      return res.status(400).send({
        message: "Invalid input",
        errors: inputCheck.error.issues,
      });
    }

    const hashpassword = await bcrypt.hash(password, 5);

    await AdminModel.create({
      firstname,
      lastname,
      email,
      password: hashpassword,
      username,
    });

    res.status(201).send({
      message: "You are successfully signed up",
    });
  } catch (e) {
    console.error("An error occurred:", e);
    res.status(500).json({
      error: e.message,
    });
  }
});
adminRouter.post("/signin", async (req, res) => {
  const admin = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(75),
  });

  const { email, password } = req.body;

  try {
    const inputCheck = admin.safeParse({ email, password });
    if (!inputCheck) {
      return res.status(400).send({
        error: inputCheck.error.issues,
      });
    }

    const adminDet = await AdminModel.findOne({ email });
    if (!adminDet) {
      return res.status(404).send({
        message: "Check your credentials",
      });
    }

    const verifyPassword = bcrypt.compare(password, adminDet.password);
    if (!verifyPassword) {
      return res.status(401).send({
        error: "Wrong credentials",
      });
    }

    const token = jwt.sign(
      {
        id: adminDet._id.toString(),
      },
      process.env.JWT_SECRET_ADMIN
    );

    res.status(200).send({
      message: "You are logged in",
      token: token,
      creatorId: adminDet.adminID,
    });
  } catch (e) {
    console.error("An error occurred:", e);
    return res.status(500).send({
      error: e.message,
    });
  }
});
adminRouter.post("/admin/course", adminAuth, async (req, res) => {
  const course = z.object({
    tittle: z.string(),
    description: z.string(),
    price: z.number(),
    imageurl: z.string(),
    creatorId: z.object(),
  });
  const { tittle, description, price, imageurl, creatorId } = req.body;
  try {
    const passCourse = course.safeParse(
      tittle,
      description,
      price,
      imageurl,
      creatorId
    );
    if (passCourse) {
      const createCourse = await CourseModel.create({
        tittle,
        description,
        price,
        imageurl,
        creatorId,
      });
      res.send({
        message: "course created",
        coursedetails: createCourse,
      });
    } else {
      return res.send({
        error: error.message,
      });
    }
  } catch (e) {
    return res.status(404).send({
      error: e.message,
    });
  }
});

module.exports = {
  adminRouter,
};
