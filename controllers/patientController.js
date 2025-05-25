const { error } = require('console')
const Patient=require('../models/PatientsModel')
const mongoose=require('mongoose')
//get all patients
const getPatients= async(req,res)=>{
    const patients= await Patient.find({}).sort({createdAt:-1})
    res.status(200).json(patients)
}

//get single patient
const getPatient=async(req,res)=>{
    const{id}=req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:'Patient Not found'})
    }

    const patient = await Patient.findById(id)


    if(!patient){
        return res.status(400).json({error: 'Patient not found'})
    }
    res.status(200).json(patient)
}
//create new patient
const createPatient= async (req,res)=>{
    const{Patient_name,Gender,DOB,Email,Address,Contact_details,Insurance_details}=req.body
    //add doc to db
    try{ 
        const patient = await Patient.create({Patient_name,Gender,DOB,Email,Address,Contact_details,Insurance_details})
        res.status(200).json(patient)

    }catch(error){
        res.status(400).json({error: error.message})

    }   
}

//delete a Patient
const deletePatient = async(req,res)=>{
    const{id}=req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:'Patient Not found'})
    }
    const patient = await Patient.findOneAndDelete({_id: id})

    if(!patient){
        return res.status(400).json({error: 'Patient not found'})
    }
    return res.status(200).json(patient)  
}

//update a patient
const updatePatient = async(req,res)=>{
    const{id}=req.params
    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error:'Patient Not found'})
    }

    const patient = await Patient.findOneAndUpdate({_id: id},{
        ...req.body
    })

    if(!patient){
        return res.status(400).json({error: 'Patient not found'})
    }
    res.status(200).json(patient)  

}

module.exports={
    getPatients,
    getPatient, 
    createPatient,
    deletePatient,
    updatePatient
    
}