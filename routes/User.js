const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");


const { User } = require('../models/userModel');
const {
  addAdmin,
  loginAdmin,
  loginSuperAdmin,
  loginDoctor,
  addDoctorWithUser, // ✅ Include new controller
  changePassword,
} = require("../controllers/userController");

const { authenticate, roleAuthorization } = require("../middleware/authMiddleware");

// ----------------------- Admin/SuperAdmin ----------------------- //

// Create admin (only accessible by super_admin)
router.post('/add-admin', authenticate, roleAuthorization(['super_admin']), addAdmin);

// Get all admins (only accessible by super_admin)
router.get('/get-admins', authenticate, roleAuthorization(['super_admin']), async (req, res) => {
  try {
    console.log("Fetching admins for user:", req.user);
    const admins = await User.find({ role: 'admin' });
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: 'Failed to fetch admins.' });
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

  try {
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

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Resent OTP for Verification",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    };

    const info = await transporter.sendMail(mailOptions);

    // Check if the email was accepted by at least one recipient
    if (!info.accepted || info.accepted.length === 0) {
      return res.status(500).json({ error: "Email delivery failed. Please check the address." });
    }

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (err) {
    console.error("Error sending OTP email:", err);
    res.status(500).json({ error: "Failed to send OTP. Please try again later." });
  }
});


// ----------------------- Doctor Creation ----------------------- //

// Create doctor (only accessible by admin)
router.post('/create-doctor', authenticate, roleAuthorization(['super_admin']), addDoctorWithUser); // ✅ New route
//router.post("/change-password", authenticate, changePassword);//



// ----------------------- Login Routes ----------------------- //

router.post("/login/admin", loginAdmin);
router.post("/login/superadmin", loginSuperAdmin);
router.post("/login/doctor", loginDoctor); // ✅ Fixed: was missing the leading "/"

module.exports = router;
