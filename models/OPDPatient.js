const mongoose = require("mongoose");

const OPDPatientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  bloodGroup: { type: String },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: Date, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
  status:{type: String, default:""}
});

module.exports = mongoose.model("OPDPatient", OPDPatientSchema);
