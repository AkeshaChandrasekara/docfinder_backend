import Doctor from "../models/Doctor.js";
import { isAdmin } from "./userController.js";

export async function getAllDoctors(req, res) {
  try {
    const doctors = await Doctor.find().populate({
      path: 'specialty',
      model: 'Specialty' 
    });
    
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No doctors found"
      });
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctors",
      error: error.message
    });
  }
}


export async function createDoctor(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ 
      message: "Unauthorized: Admin privileges required" 
    });
  }

  try {
  
    if (!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.specialty) {
      return res.status(400).json({ 
        message: "Validation failed",
        errors: {
          firstName: !req.body.firstName ? "First name is required" : undefined,
          lastName: !req.body.lastName ? "Last name is required" : undefined,
          email: !req.body.email ? "Email is required" : undefined,
          specialty: !req.body.specialty ? "Specialty is required" : undefined
        }
      });
    }

    if (req.body.availableDays && req.body.availableDays.length > 0) {
      for (const day of req.body.availableDays) {
        if (!day.day) {
          return res.status(400).json({
            message: "Validation failed",
            errors: { availableDays: "Day selection is required for all availability entries" }
          });
        }
        
        if (!day.slots || day.slots.length === 0) {
          return res.status(400).json({
            message: "Validation failed",
            errors: { availableDays: "At least one time slot is required for each day" }
          });
        }

        for (const slot of day.slots) {
          if (!slot.startTime || !slot.endTime) {
            return res.status(400).json({
              message: "Validation failed",
              errors: { availableDays: "Both start and end times are required for each time slot" }
            });
          }
        }
      }
    }

    const doctor = new Doctor(req.body);
    await doctor.validate(); 
    await doctor.save();
    
    res.status(201).json({ 
      message: "Doctor created successfully",
      doctor 
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({ 
        message: "Validation failed",
        errors 
      });
    }
    
    res.status(500).json({ 
      message: error.message || "Internal server error"
    });
  }
}

export async function updateDoctor(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ message: "Unauthorized" });

  try {
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('specialty');
    res.json({ message: "Doctor updated", doctor: updatedDoctor });
  } catch (error) {
    res.status(400).json({ message: "Error updating doctor" });
  }
}

export async function deleteDoctor(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ message: "Unauthorized" });

  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting doctor" });
  }
}

export async function getDoctorById(req, res) {
  try {
    const doctor = await Doctor.findById(req.params.id).populate({
      path: 'specialty',
      model: 'Specialty'
    });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctor",
      error: error.message
    });
  }
}