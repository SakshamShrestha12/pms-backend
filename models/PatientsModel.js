const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const patientSchema = new Schema({
  Patient_name: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  Contact_details: {
    type: Number,
    required: true,
  },
  consultant: {
    type: String,
    required: true,
  },
  Insurance_details: {
    type: Number,
    required: false,
  },

  // ✅ NEW: Reference to the assigned doctor
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: false, // Optional if not all patients are assigned yet
  },
},
{
  timestamps: true
});

module.exports = mongoose.model('Patient', patientSchema);
