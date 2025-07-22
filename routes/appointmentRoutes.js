import express from 'express';
import { createAppointment, getAppointmentById,getAllAppointments,updateAppointmentStatus} from '../controllers/appointmentController.js';
import { verifyToken } from './userRouter.js';

const router = express.Router();

router.post('/', verifyToken, createAppointment);
router.get('/:id', verifyToken, getAppointmentById);
router.get('/', verifyToken, getAllAppointments);
router.patch('/:id', verifyToken, updateAppointmentStatus);

export default router;