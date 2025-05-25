const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");
const Doctor = require("../models/Doctor");

// --------------------------- Admin / Super Admin ---------------------------

const addAdmin = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const validRoles = ["admin", "super_admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: `${role === "admin" ? "Admin" : "Super Admin"} added successfully.`,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Error adding admin:", error);
    res.status(500).json({ error: "Server Error, unable to add admin." });
  }
};

// --------------------------- Login Controllers ---------------------------

const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const user = await User.findOne({ email, role: "super_admin" });
    if (!user) {
      return res.status(404).json({ error: "Super Admin not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const user = await User.findOne({ email, role: "admin" });
    if (!user) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect Password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "doctor" });
  if (!user) return res.status(404).json({ error: "Doctor not found" });

  if (!user.isVerified) {
    return res.status(401).json({ error: "Please verify your email before logging in." });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Incorrect Password" });

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.SECRET, {
    expiresIn: "1h",
  });

  const doctor = await Doctor.findById(user.doctorRef);

  res.json({
    token,
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      firstLogin: doctor?.firstLogin ?? true,
    },
  });
};



// --------------------------- Create Doctor with Linked User ---------------------------

const nodemailer = require("nodemailer");

// inside addDoctorWithUser controller
const addDoctorWithUser = async (req, res) => {
  const { name, email, password, department_id, specialization, availability } = req.body;

  try {
    if (!name || !email || !password || !department_id) {
      return res.status(400).json({ error: "All required fields must be filled." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: "doctor",
    });

    const newDoctor = await Doctor.create({
      name,
      department_id,
      specialization,
      availability,
      userId: newUser._id,
    });

    newUser.doctorRef = newDoctor._id;

    // 🔐 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    newUser.otp = otp;
    newUser.otpExpiresAt = Date.now() + 10 * 60 * 1000; // 10 min
    await newUser.save();

    // 📧 Send OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // App Password
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Doctor Account Verification",
      text: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    });

    res.status(201).json({
      success: true,
      message: "Doctor created. Verification OTP sent to email.",
      user: {
        id: newUser._id,
        email: newUser.email,
        doctorRef: newDoctor._id,
      },
    });
  } catch (error) {
    console.error("Error creating doctor user:", error);
    res.status(500).json({ error: "Server Error while creating doctor." });
  }
};

module.exports = {
  addAdmin,
  loginAdmin,
  loginSuperAdmin,
  loginDoctor,
  addDoctorWithUser,
};
