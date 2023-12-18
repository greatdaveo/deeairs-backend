const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  locationOwner: { type: mongoose.Schema.Types.ObjectsId, ref: "User" },
  title: String,
  address: String,
  photos: String,
  description: String,
  features: [String],
  extraInfo: String,
  checkIn: Number,
  checkOut: Number,
  maxGuests: Number,
});

const LocationModel = mongoose.model("Location", LocationSchema);

module.exports = LocationModel;
