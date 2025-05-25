const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const IPDPatient = require("../models/IPDPatient"); // ✅ Correct model
const OPDPatient= require("../models/OPDPatient")
const { authenticate, roleAuthorization } = require("../middleware/authMiddleware");

// 📌 Create a new doctor
// 📌 Create a new doctor
router.post("/", authenticate, roleAuthorization(["admin"]), async (req, res) => {
  try {
    const doctorData = { ...req.body, firstLogin: true }; // ✅ Always force firstLogin true
    const doctor = new Doctor(doctorData);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// 📌 Get all doctors
router.get("/", authenticate, roleAuthorization(["admin", "super_admin"]), async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("department_id", "name");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get doctors by department ID
router.get("/by-department/:departmentId", authenticate, roleAuthorization(["admin", "super_admin"]), async (req, res) => {
  try {
    const { departmentId } = req.params;
    const doctors = await Doctor.find({ department_id: departmentId });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/my-patients", authenticate, roleAuthorization(["doctor"]), async (req, res) => {
  try {
    console.log("🔍 Incoming request with type:", req.query.type);

    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      console.log("❌ Doctor profile not found");
      return res.status(404).json({ error: "Doctor profile not found" });
    }

    const patientType = req.query.type || "ipd";
    let patients;

    if (patientType === "ipd") {
      console.log("🔎 Fetching IPD patients...");
      patients = await IPDPatient.find({ doctor: doctor._id }).populate("department", "name");
    } else if (patientType === "opd") {
      console.log("🔎 Fetching OPD patients...");
      patients = await OPDPatient.find({ doctor: doctor._id }).populate("department", "name");
    } else {
      return res.status(400).json({ error: "Invalid patient type" });
    }

    console.log("✅ Patients found:", patients.length);
    res.status(200).json(patients);
  } catch (error) {
    console.error("🔥 SERVER ERROR in /my-patients:", error.message);
    res.status(500).json({ error: "Server error fetching patients" });
  }
});

router.get("/me", authenticate, roleAuthorization(["doctor"]), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate("department_id", "name");
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router.post("/verify-email", async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.isVerified) {
    return res.status(400).json({ error: "Invalid or already verified" });
  }

  if (user.otp !== otp || Date.now() > user.otpExpiresAt) {
    return res.status(400).json({ error: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiresAt = null;
  await user.save();

  res.status(200).json({ message: "Email verified successfully" });
});

router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user || user.isVerified) {
    return res.status(400).json({ error: "Invalid email or already verified." });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiresAt = Date.now() + 10 * 60 * 1000;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Resent OTP for Verification",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });

  res.status(200).json({ message: "OTP sent" });
});

//  Update a doctor's information
router.put("/:id", authenticate, roleAuthorization(["admin", "super_admin"]), async (req, res) => {
  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedDoctor) return res.status(404).json({ error: "Doctor not found" });

    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//  Delete a doctor
router.delete("/:id", authenticate, roleAuthorization(["admin", "super_admin"]), async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) return res.status(404).json({ error: "Doctor not found" });

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
