import express from "express";
import {
  getAllChanellingCenters,
  createChanellingCenter,
  updateChanellingCenter,
  deleteChanellingCenter,
} from "../controllers/chanellingCenterController.js";
import { verifyToken } from './userRouter.js';

const router = express.Router();

router.get("/", verifyToken, getAllChanellingCenters);
router.post("/", verifyToken, createChanellingCenter);
router.patch("/:id", verifyToken, updateChanellingCenter);
router.delete("/:id", verifyToken, deleteChanellingCenter);

export default router;