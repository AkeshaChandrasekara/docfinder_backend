import express from 'express';
import { createAppointment, getAppointmentById,getAllAppointments,updateAppointmentStatus,getUserAppointments} from '../controllers/appointmentController.js';
import { verifyToken } from './userRouter.js';

const router = express.Router();

router.post('/', verifyToken, createAppointment);
router.get('/:id', verifyToken, getAppointmentById);
router.get('/', verifyToken, getAllAppointments);
router.patch('/:id', verifyToken, updateAppointmentStatus);
router.get('/user/appointments', verifyToken, getUserAppointments);

export default router;