const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  specialization: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  availability: [
    {
      day: { type: String, required: true },
      start_time: { type: String, required: true },
      end_time: { type: String, required: true },
    },
  ],
  firstLogin: { type: Boolean, default: true }, // ✅ Add this line
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
