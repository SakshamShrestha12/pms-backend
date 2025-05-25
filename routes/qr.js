// routes/qr.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const QrCode = require("../models/QrCode");
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/qr"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

// Upload QR and save to DB
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { name, billId } = req.body;

    const qrCode = new QrCode({
      name,
      billId,
      filePath: req.file.path,
    });

    await qrCode.save();

    res.status(201).json({ message: "QR Code saved", qrCode });
  } catch (err) {
    console.error("QR Upload Error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});
// GET static hospital QR code
router.get("/", async (req, res) => {
  try {
    const qr = await QrCode.findOne().sort({ createdAt: -1 }); // latest
    if (!qr) return res.status(404).json({ message: "No QR code found" });
    res.json(qr);
  } catch (err) {
    console.error("QR Fetch Error:", err);
    res.status(500).json({ message: "Failed to fetch QR" });
  }
});


module.exports = router;