const express = require("express");
const OPDPatient = require("../models/OPDPatient"); // ✅ Correct OPD model
const Department = require("../models/DepartmentsModel");
const Doctor = require("../models/Doctor");

const router = express.Router();

// 📌 Register a new OPD patient
router.post("/", async (req, res) => {  
  try {
    console.log("Received data:", req.body);

    const { name, date, age, gender, bloodGroup, address, phone, dob, department, doctor } = req.body;

    // Validate Department
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(400).json({ error: "Invalid department ID!" });
    }

    // Validate Doctor
    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(400).json({ error: "Invalid doctor ID!" });
    }

    // Create new patient
    const newPatient = new OPDPatient({
      name,
      date,
      age,
      gender,
      bloodGroup,
      address,
      phone,
      dob,
      department,
      doctor,
    });

    await newPatient.save();

    console.log("Patient saved successfully!");
    res.status(201).json({ message: "OPD patient registered successfully", patient: newPatient });
  } catch (error) {
    console.error("Error saving patient:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get all OPD patients with department and doctor details
router.get("/", async (req, res) => {  
  try {
    const opdPatients = await OPDPatient.find()
      .populate("department", "name") // Populate department name
      .populate("doctor", "name"); // Populate doctor name

    res.json(opdPatients);
  } catch (error) {
    console.error("Error fetching OPD patients:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update OPD patient details
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating OPD patient with ID:", id, "New Data:", req.body);

    // Validate if patient exists
    let patient = await OPDPatient.findById(id);
    if (!patient) {
      return res.status(404).json({ error: "OPD patient not found" });
    }

    // Update patient details
    patient = await OPDPatient.findByIdAndUpdate(id, req.body, { new: true });

    res.json({ message: "OPD patient updated successfully", patient });
  } catch (error) {
    console.error("Error updating OPD patient:", error);
    res.status(500).json({ error: error.message });
  }
});
// 📌 Delete an OPD patient by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting OPD patient with ID:", id);

    // Validate if patient exists
    const patient = await OPDPatient.findById(id);
    if (!patient) {
      return res.status(404).json({ error: "OPD patient not found" });
    }

    // Delete the patient record
    await OPDPatient.findByIdAndDelete(id);

    console.log("Patient deleted successfully!");
    res.json({ message: "OPD patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
