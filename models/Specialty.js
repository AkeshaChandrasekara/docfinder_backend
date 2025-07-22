import mongoose from "mongoose";

const specialtySchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Specialty = mongoose.model("Specialty", specialtySchema);
export default Specialty;