import express from "express";
import mongoose from "mongoose";
import {
  getMedicalFolder,
  updateMedicalFolder,
} from "../Controllers/medicalFolderController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";
import Booking from "../models/BookingSchema.js";

const router = express.Router();

const canAccessFolder = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) {
      return res.status(404).json({ success: false, message: "Medical folder not found" });
    }

    if (req.role === "patient") {
      if (req.userId === patientId) return next();
    } else if (req.role === "doctor") {
      const bookings = await Booking.countDocuments({
        user: patientId,
        doctor: req.userId,
        status: { $ne: "cancelled" },
      });
      if (bookings > 0) return next();
    }

    return res.status(403).json({ success: false, message: "Unauthorized" });
  } catch (err) {
    console.error("Medical folder access check failed:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

router.get(
  "/:patientId",
  authenticate,
  restrict(["patient", "doctor"]),
  canAccessFolder,
  getMedicalFolder
);

router.patch(
  "/:patientId",
  authenticate,
  restrict(["doctor"]),
  canAccessFolder,
  updateMedicalFolder
);

export default router;