const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const imageDownloader = require("image-downloader");
const multer = require("multer");
const fs = require("fs");

// To import the models
const UserModel = require("./models/User");
const LocationModel = require("./models/LocationModel");

const app = express();
// To encrypt the password
const bcryptSalt = bcrypt.genSaltSync(10);
// For JWT
const jwtSecret = "ioujhyt67d89ew0iowjhgytfghsjdwiofv897we";

// MIDDLEWARES
app.use(cookieParser());
app.use(express.json());

// Middleware to show the photo in the browser
app.use("/uploads", express.static(__dirname + "/uploads"));

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
        {
          email: loggedInUserDoc.email,
          id: loggedInUserDoc._id,
        },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(loggedInUserDoc);
        }
      );
    } else {
      res.status(422).json("Password is not correct!");
    }
  } else {
    res.json("User not found!");
  }
});

// TO HANDLE COOKIE WHEN A USER LOG IN
app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, cookieData) => {
      if (err) throw err;
      const { name, email, _id } = await UserModel.findById(cookieData.id);

      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

// TO HANDLE LOGOUT
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

// To HANDLE UPLOADED DOCUMENTS e.g photos
app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  // To rename the url
  const newName = "photo" + Date.now() + ".jpg";

  const options = {
    url: link,
    dest: __dirname + "/uploads/" + newName,
  };

  await imageDownloader.image(options);
  // res.json(__dirname + "/uploads/" + newName);
  res.json(newName);
});

// To Upload Photo from Device
const photoMiddleware = multer({ dest: "uploads" });

app.post("/upload", photoMiddleware.array("photos", 100), (req, res) => {
  const uploadedFiles = [];

  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname } = req.files[i];
    const partOfOriginalName = originalname.split(".");
    const ext = partOfOriginalName[partOfOriginalName.length - 1];
    const newPath = path + "." + ext;
    fs.renameSync(path, newPath);
    uploadedFiles.push(newPath.replace("uploads", ""));
  }
  // res.json(req.files);
  res.json(uploadedFiles);
});

// To Submit Location Form
app.post("/locations", (req, res) => {
  const { token } = req.cookies;

  const {
    title,
    address,
    addedPhotos,
    description,
    features,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;

  // console.log(req.body);

  jwt.verify(token, jwtSecret, {}, async (err, cookieData) => {
    if (err) throw err;

    const locationDoc = await LocationModel.create({
      locationOwner: cookieData.id,
      title,
      address,
      addedPhotos,
      description,
      features,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    });

    res.json(locationDoc);
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000!!!");
}); 

