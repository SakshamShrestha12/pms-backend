const express = require("express");
const IPDPatient = require("../models/IPDPatient");
const Department = require("../models/DepartmentsModel");
const Doctor = require("../models/Doctor");

const router = express.Router();

// 📌 Register a new IPD patient
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
    const newPatient = new IPDPatient({
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
    res.status(201).json({ message: "IPD patient registered successfully", patient: newPatient });
  } catch (error) {
    console.error("Error saving patient:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Get all IPD patients with department and doctor details
router.get("/", async (req, res) => {  
  try {
    const ipdPatients = await IPDPatient.find()
      .populate("department", "name") // Populate department name
      .populate("doctor", "name"); // Populate doctor name

    res.json(ipdPatients);
  } catch (error) {
    console.error("Error fetching IPD patients:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Update IPD patient details
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Updating patient with ID:", id, "New Data:", req.body);

    // Validate if patient exists
    let patient = await IPDPatient.findById(id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Update patient details
    patient = await IPDPatient.findByIdAndUpdate(id, req.body, { new: true });

    res.json({ message: "Patient updated successfully", patient });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: error.message });
  }
});

// 📌 Delete IPD patient (Cancel appointment)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting patient with ID:", id);

    // Validate if patient exists
    const patient = await IPDPatient.findById(id);
    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    // Delete the patient
    await IPDPatient.findByIdAndDelete(id);

    res.json({ message: "Patient appointment cancelled successfully" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;