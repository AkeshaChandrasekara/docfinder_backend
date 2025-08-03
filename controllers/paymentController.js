import stripePackage from 'stripe';
import Appointment from '../models/appointment.js';
import Doctor from '../models/Doctor.js';

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    console.log('Received payment intent request:', {
      amount: req.body.amount,
      doctorId: req.body.doctorId,
      hasAppointmentData: !!req.body.appointmentData,
      user: req.user?.id
    });

    if (!req.body.amount || !req.body.doctorId || !req.body.appointmentData) {
      console.error('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const { amount, doctorId, appointmentData } = req.body;
    
    const amountInCents = Math.round(Number(amount));
    if (isNaN(amountInCents) || amountInCents <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      console.error('Doctor not found:', doctorId);
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    let frontendBaseUrl = process.env.FRONTEND_URL || 'https://docfinder-online.vercel.app';
    if (!frontendBaseUrl.startsWith('http')) {
      frontendBaseUrl = `https://${frontendBaseUrl}`;
    }

    const successUrl = new URL('/payment-success', frontendBaseUrl);
    successUrl.searchParams.set('session_id', '{CHECKOUT_SESSION_ID}');
    
    const cancelUrl = new URL(`/booking/${doctorId}`, frontendBaseUrl);
    cancelUrl.searchParams.set('payment_canceled', 'true');

    console.log('Creating Stripe checkout session with URLs:', {
      successUrl: successUrl.toString(),
      cancelUrl: cancelUrl.toString()
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: `Consultation with Dr. ${doctor.firstName} ${doctor.lastName}`,
            description: `Appointment on ${appointmentData.date} at ${appointmentData.time}`
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      metadata: {
        doctorId: doctorId.toString(),
        userId: req.user?.id?.toString(),
        appointmentData: JSON.stringify({
          ...appointmentData,
          consultationFee: doctor.consultationFee
        })
      }
    });

    console.log('Stripe session created successfully:', session.id);
    return res.status(200).json({ 
      success: true, 
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Error in createPaymentIntent:', {
      error: error.message,
      stack: error.stack,
      stripeError: error.raw || null
    });
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
export const handlePaymentSuccess = async (req, res) => {
  try {
    console.log('Handling payment success...'); 
    const { session_id } = req.query;
    
    if (!session_id || session_id === '{CHECKOUT_SESSION_ID}') {
      console.error('Invalid session ID:', session_id);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid session ID' 
      });
    }

    console.log('Retrieving Stripe session...'); 
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!session || session.payment_status !== 'paid') {
      console.error('Payment not completed:', session?.payment_status);
      return res.status(400).json({ 
        success: false, 
        message: 'Payment not completed' 
      });
    }

    const { doctorId, userId, appointmentData } = session.metadata;
    const parsedAppointmentData = JSON.parse(appointmentData);
 
    console.log('Creating appointment...'); 
    const appointment = new Appointment({
      doctor: doctorId,
      user: userId,
      date: parsedAppointmentData.date,
      time: parsedAppointmentData.time,
      startTime: parsedAppointmentData.startTime,
      endTime: parsedAppointmentData.endTime,
      patientName: parsedAppointmentData.patientName,
      phoneNumber: parsedAppointmentData.phoneNumber,
      email: parsedAppointmentData.email,
      notes: parsedAppointmentData.notes,
      status: 'confirmed',
      paymentMethod: 'payOnline',
      paymentStatus: 'paid',
      consultationFee: parsedAppointmentData.consultationFee
    });

    await appointment.save();
    
    console.log('Appointment created:', appointment._id); 
    res.status(200).json({
      success: true,
      appointmentId: appointment._id
    });

  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment success',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};