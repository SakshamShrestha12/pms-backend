const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  patient_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  patient_type: {
    type: String,
    enum: ['ipd', 'opd'],
    required: true
  },
  items: [
    {
      type: { type: String, required: true },  // "Medicine" or "Service"
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      total: { type: Number, required: true },
    }
  ],
  total: { type: Number, required: true },
}, { timestamps: true });

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
