import express from 'express';
import { createPaymentIntent, handlePaymentSuccess } from '../controllers/paymentController.js';
import { verifyToken } from './userRouter.js';

const router = express.Router();

router.post('/create-payment-intent', verifyToken, createPaymentIntent);
router.get('/success', handlePaymentSuccess);

export default router;