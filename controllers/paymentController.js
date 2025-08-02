import stripePackage from 'stripe';
import Appointment from '../models/appointment.js';
import Doctor from '../models/Doctor.js';

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount, doctorId, appointmentData } = req.body;
    
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const frontendBaseUrl = process.env.FRONTEND_URL.startsWith('https') 
      ? process.env.FRONTEND_URL 
      : `https://${process.env.FRONTEND_URL}`;
    
    const successUrl = `${frontendBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendBaseUrl}/booking/${doctorId}?payment_canceled=true`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: `Consultation with Dr. ${doctor.firstName} ${doctor.lastName}`,
            description: `Appointment on ${appointmentData.date} at ${appointmentData.time}`
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        doctorId: doctorId.toString(),
        userId: req.user.id.toString(),
        appointmentData: JSON.stringify({
          ...appointmentData,
          consultationFee: doctor.consultationFee
        })
      }
    });

    res.status(200).json({ 
      success: true, 
      sessionId: session.id 
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create payment intent',
      error: error.message 
    });
  }
};

export const handlePaymentSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id || session_id === '{CHECKOUT_SESSION_ID}') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid session ID' 
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment not completed' 
      });
    }

    const { doctorId, userId, appointmentData } = session.metadata;
    const parsedAppointmentData = JSON.parse(appointmentData);
    
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
      status: 'paid',
      paymentMethod: 'payOnline',
      consultationFee: parsedAppointmentData.consultationFee
    });

    await appointment.save();
    
    res.status(200).json({
      success: true,
      appointmentId: appointment._id
    });

  } catch (error) {
    console.error('Error handling payment success:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process payment success',
      error: error.message 
    });
  }
};