import mongoose from "mongoose";

const doctorSchema = mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty', required: true },
  qualifications: [{ type: String }],
  experience: { type: Number, required: true },
  bio: { type: String },
  photo: { type: String, default: "https://cdn-icons-png.flaticon.com/512/3304/3304567.png" },
  hospital: { type: String },
  availableDays: [{
    day: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    slots: [{
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      isAvailable: { type: Boolean, default: true }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;