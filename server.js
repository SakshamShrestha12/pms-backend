require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const PatientRoutes = require("./routes/Patients");
const userRoutes = require("./routes/User");
const IPDRoutes = require("./routes/ipdRegister");
const OPDRoutes = require("./routes/opdRegister");
const departmentRoutes = require("./routes/departments");
const doctorRoutes = require("./routes/doctors");
const billRoutes = require("./routes/billingRoute");
const NoteRoutes = require("./routes/NoteRoutes");
const qrRoutes = require("./routes/qr");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve QR/static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Routes
app.use("/api/Patients", PatientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/opd", OPDRoutes);
app.use("/api/ipd", IPDRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/notes", NoteRoutes);
app.use("/api/qr", qrRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Connect to DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Connected to DB & listening to port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
