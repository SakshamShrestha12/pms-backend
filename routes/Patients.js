const express=require('express')
const {
    createPatient,
    getPatients,
    getPatient,
    updatePatient,
    deletePatient
}=require('../controllers/patientController')

const router=express.Router()


//Get all Patient from OPD
router.get('/',getPatients)
//Get a single Patient
router.get('/:id',getPatient)
//post  Patient
router.post('/',createPatient)
//Delete a Patient
router.delete('/:id',deletePatient)
//Update Patient
router.patch('/:id',updatePatient)

module.exports = router