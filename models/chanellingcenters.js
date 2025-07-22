import mongoose from "mongoose";

const chanellingcenterSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
 
});

const ChanellingCenter = mongoose.model("ChanellingCenter", chanellingcenterSchema);
export default ChanellingCenter;