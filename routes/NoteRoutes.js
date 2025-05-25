const express = require('express');
const router = express.Router();
const Note = require('../models/Notes');

// GET note by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    const note = await Note.findOne({ patient_id: req.params.patientId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new note
router.post('/', async (req, res) => {
  try {
    const { patient_id, doctor_id, diagnosis, procedures, medications, followUp, specialInstructions } = req.body;

    const newNote = new Note({ patient_id, doctor_id, diagnosis, procedures, medications, followUp, specialInstructions });
    await newNote.save();

    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT (update) an existing note
router.put('/:noteId', async (req, res) => {
  try {
    const updated = await Note.findByIdAndUpdate(req.params.noteId, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
