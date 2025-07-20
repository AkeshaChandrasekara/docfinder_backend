import express from 'express';
import { 
  getAllDoctors, 
  createDoctor, 
  updateDoctor, 
  deleteDoctor, getDoctorById, 
} from '../controllers/doctorController.js';
import { verifyToken } from './userRouter.js';

const router = express.Router();

router.get("/", getAllDoctors);
router.post("/", verifyToken, createDoctor);
router.put("/:id", verifyToken, updateDoctor);
router.delete("/:id", verifyToken, deleteDoctor);
router.get("/:id", getDoctorById);

export default router;