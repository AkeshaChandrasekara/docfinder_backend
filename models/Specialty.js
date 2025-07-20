import mongoose from "mongoose";

const specialtySchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String, default: "https://cdn-icons-png.flaticon.com/512/2965/2965300.png" },
  createdAt: { type: Date, default: Date.now }
});

const Specialty = mongoose.model("Specialty", specialtySchema);
export default Specialty;