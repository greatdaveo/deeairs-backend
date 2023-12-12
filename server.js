const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();

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
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  res.json({ name, email, password });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000!!!");
}); 

