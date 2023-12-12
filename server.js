const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// To import the models
const UserModel = require("./models/User");

const app = express();

// To encrypt the password
const bcryptSalt = bcrypt.genSaltSync(10);
// For JWT
const jwtSecret = "ioujhyt67d89ew0iowjhgytfghsjdwiofv897we";

// MIDDLEWARES
app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URL);

// END POINTS
app.get("/test", (req, res) => {
  res.json("test ok");
});

// For user registration
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const registeredUserDoc = await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });

    res.json(registeredUserDoc);
  } catch (err) {
    alert(err);
    res.status(422).json(err);
  }
});

// For user Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const loggedInUserDoc = await UserModel.findOne({ email });

  if (loggedInUserDoc) {
    const passwordOk = bcrypt.compareSync(password, loggedInUserDoc.password);
    if (passwordOk) {
      jwt.sign(
        { email: loggedInUserDoc.email, id: loggedInUserDoc._id },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json("Password is correct!");
        }
      );
    } else {
      res.status(422).json("Password is not correct!");
    }
  } else {
    res.json("User not found!");
  }
});

app.listen(4000, () => {
  console.log("Server is running on port 4000!!!");
}); 

