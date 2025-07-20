import Specialty from "../models/Specialty.js";
import { isAdmin } from "./userController.js";

export async function getAllSpecialties(req, res) {
  try {
    const specialties = await Specialty.find();
    res.status(200).json({
      success: true,
      count: specialties.length,
      data: specialties
    });
  } catch (error) {
    console.error("Error fetching specialties:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching specialties",
      error: error.message
    });
  }
}


export async function createSpecialty(req, res) {
  if (!isAdmin(req)) {
    return res.status(403).json({ 
      message: "Unauthorized: Admin privileges required" 
    });
  }

  try {
  
    if (!req.body.name) {
      return res.status(400).json({ 
        message: "Validation failed",
        errors: { name: "Specialty name is required" }
      });
    }

    const specialty = new Specialty({
      name: req.body.name,
      description: req.body.description || '',
      icon: req.body.icon || 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png'
    });

    await specialty.validate();
    await specialty.save();
    
    res.status(201).json({ 
      message: "Specialty created successfully",
      specialty 
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
export async function updateSpecialty(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ message: "Unauthorized" });

  try {
    const updatedSpecialty = await Specialty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: "Specialty updated", specialty: updatedSpecialty });
  } catch (error) {
    res.status(400).json({ message: "Error updating specialty" });
  }
}

export async function deleteSpecialty(req, res) {
  if (!isAdmin(req)) return res.status(403).json({ message: "Unauthorized" });

  try {
    await Specialty.findByIdAndDelete(req.params.id);
    res.json({ message: "Specialty deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting specialty" });
  }
}