const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const IPDPatient = require('../models/IPDPatient');
const OPDPatient = require('../models/OPDPatient');
const mongoose = require('mongoose');

// ========================
// POST: Create a new bill
// ========================
router.post('/', async (req, res) => {
  const { patient_id, items, total, patient_type } = req.body;

  if (!patient_id || !items || !total || !patient_type) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!mongoose.Types.ObjectId.isValid(patient_id)) {
    return res.status(400).json({ message: "Invalid patient ID" });
  }

  try {
    let patient;

    if (patient_type === "ipd") {
      patient = await IPDPatient.findById(patient_id);
    } else if (patient_type === "opd") {
      patient = await OPDPatient.findById(patient_id);
    } else {
      return res.status(400).json({ message: "Invalid patient type" });
    }

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const newBill = new Bill({
      patient_id,
      items,
      total,
      patient_type, // optional but useful for reference
    });

    await newBill.save();
    res.status(201).json({ message: "Bill created successfully", bill: newBill });
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(500).json({ message: "Error creating bill", error: error.message });
  }
});

// =======================================
// GET: Fetch bills by patient ObjectId
// =======================================
router.get('/by-patient/:id', async (req, res) => {
  const patientId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ message: "Invalid patient ID" });
  }

  try {
    const bills = await Bill.find({ patient_id: patientId });

    if (!bills || bills.length === 0) {
      return res.status(404).json({ message: "No bills found for this patient" });
    }

    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ message: "Error fetching bills", error: error.message });
  }
});
// 📌 Get all billing records
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find();
    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching all bills:", error);
    res.status(500).json({ message: "Error fetching bills", error: error.message });
  }
});

module.exports = router;
