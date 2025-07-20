import express from 'express';
import { 
  getAllSpecialties, 
  createSpecialty, 
  updateSpecialty, 
  deleteSpecialty 
} from '../controllers/specialtyController.js';
import { verifyToken } from './userRouter.js';

const router = express.Router();

router.get("/", getAllSpecialties);
router.post("/", verifyToken, createSpecialty);
router.put("/:id", verifyToken, updateSpecialty);
router.delete("/:id", verifyToken, deleteSpecialty);

export default router;