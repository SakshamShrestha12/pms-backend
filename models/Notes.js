const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Patient',
    unique: true, // one note per patient
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  diagnosis: String,
  procedures: String,
  medications: String,
  followUp: String,
  specialInstructions: String,
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
