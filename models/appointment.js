import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  doctor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Doctor',
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  date: { 
    type: Date, 
    required: true 
  },
  time: { 
    type: String, 
    required: true 
  },
  patientName: { 
    type: String, 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true 
  },
  notes: { 
    type: String 
  },
  paymentMethod: { 
    type: String, 
    enum: ['payAtClinic', 'payOnline'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'paid'],
    default: 'pending' 
  },
  consultationFee: { 
    type: Number, 
    required: true 
  },
  appointmentNumber: {
    type: String,
    unique: true
  },
  patientQueueNumber: {
    type: Number
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});


appointmentSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
  
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      }
    });
    this.appointmentNumber = `APP-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const queueCount = await this.constructor.countDocuments({
      doctor: this.doctor,
      date: this.date
    });
    this.patientQueueNumber = queueCount + 1;

    next();
  } catch (err) {
    next(err);
  }
});

const Appointment = mongoose.model("appointment", appointmentSchema);
export default Appointment;