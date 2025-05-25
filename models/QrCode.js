// models/QrCode.js
const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("QrCode", qrCodeSchema);
