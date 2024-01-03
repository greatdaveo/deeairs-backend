const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  locationOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  address: String,
  addedPhotos: [String],
  description: String,
  features: [String],
  extraInfo: String,
  checkIn: String,
  checkOut: String,
  maxGuests: Number,
  price: Number,
});

const LocationModel = mongoose.model("Location", LocationSchema);

module.exports = LocationModel;
