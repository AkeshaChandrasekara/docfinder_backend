import ChanellingCenter from "../models/chanellingcenters.js";
import mongoose from "mongoose";

export const getAllChanellingCenters = async (req, res) => {
  try {
    const centers = await ChanellingCenter.find();
    res.status(200).json({
      success: true,
      data: centers
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to load chanelling centers"
    });
  }
};

export const createChanellingCenter = async (req, res) => {
  const { name, description } = req.body;

  try {
    const newCenter = new ChanellingCenter({
      name,
      description,
    });

    await newCenter.save();
    res.status(201).json(newCenter);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updateChanellingCenter = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send("No center with that id");
  }

  try {
    const updatedCenter = await ChanellingCenter.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );
    res.status(200).json(updatedCenter);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};


export const deleteChanellingCenter = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).send("No center with that id");
  }

  try {
    await ChanellingCenter.findByIdAndRemove(id);
    res.status(200).json({ message: "Center deleted successfully" });
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};