require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
app.use(express.json);

function userAuth(req, res, next) {
  const Token = req.headers.token;
  const verifyUser = jwt.verify(Token, process.env.JWT_SECRET_USER);
  if (verifyUser) {
    req.id = verifyUser.id;
    next();
  } else {
    return res.send({
      message: "pls login again",
    });
  }
}

module.exports = {
  userAuth,
};