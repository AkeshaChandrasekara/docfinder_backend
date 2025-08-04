import Appointment from '../models/appointment.js';
import Doctor from '../models/Doctor.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export async function createAppointment(req, res) {
  try {
    const { doctorId, date, time, patientName, phoneNumber, email, notes, paymentMethod } = req.body;
 
    if (!doctorId || !date || !time || !patientName || !phoneNumber || !email || !paymentMethod) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

   
    if (!req.user || !req.user.email) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

   
    const user = await User.findOne({ email: req.user.email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }

    
    const appointment = new Appointment({
      doctor: doctorId,
      user: user._id,
      date,
      time,
      patientName,
      phoneNumber,
      email,
      notes,
      paymentMethod,
      status: paymentMethod === 'payOnline' ? 'paid' : 'pending',
      consultationFee: doctor.consultationFee
    });

    await appointment.save();

   
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'doctor',
        populate: {
          path: 'specialty',
          model: 'Specialty'
        }
      })
      .populate('user');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: populatedAppointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
}

export async function getAppointmentById(req, res) {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'firstName lastName specialty photo consultationFee address hospital experience qualifications',
        populate: {
          path: 'specialty',
          model: 'Specialty',
          select: 'name'
        }
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email profilePicture'
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.SECRET);
    
    if (appointment.user._id.toString() !== decoded.id && decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
}


export async function getAllAppointments(req, res) {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'doctor',
        select: 'firstName lastName specialty',
        populate: {
          path: 'specialty',
          model: 'Specialty',
          select: 'name'
        }
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
}

export async function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;


    const validStatuses = ['pending', 'confirmed', 'paid', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status provided',
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

   
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.SECRET);
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update appointment status',
      });
    }

  
    appointment.status = status.toLowerCase();
    await appointment.save();

    const updatedAppointment = await Appointment.findById(id)
      .populate({
        path: 'doctor',
        select: 'firstName lastName specialty',
        populate: {
          path: 'specialty',
          model: 'Specialty',
          select: 'name',
        },
      });

    res.status(200).json({
      success: true,
      message: 'Appointment status updated successfully',
      data: updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message,
    });
  }
}

export async function getUserAppointments(req, res) {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.SECRET);
    
    const appointments = await Appointment.find({ user: decoded.id })
      .populate({
        path: 'doctor',
        select: 'firstName lastName specialty photo consultationFee',
        populate: {
          path: 'specialty',
          model: 'Specialty',
          select: 'name'
        }
      })
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user appointments',
      error: error.message
    });
  }
}