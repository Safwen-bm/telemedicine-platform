import express from "express";
import { authenticate, restrict } from "./../auth/verifyToken.js";
import {
  getCheckoutSession,
  getAllBookings,
  sendReminder,
  cancelBooking,
  completeBooking,
} from "../Controllers/bookingController.js";
import Booking from "../models/BookingSchema.js";

const router = express.Router();

router.post("/checkout-session/:doctorId", authenticate, getCheckoutSession);
router.get("/", authenticate, restrict(["admin"]), getAllBookings);
router.get("/:id", authenticate, restrict(["patient", "doctor"]), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("doctor", "name");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const userId = req.userId;
    if (
      userId !== booking.user._id.toString() &&
      userId !== booking.doctor._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("Error fetching booking:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.post("/notify/:id", authenticate, restrict(["patient", "doctor"]), sendReminder);
router.delete("/cancel/:id", authenticate, restrict(["admin", "patient", "doctor"]), cancelBooking);
router.patch("/complete/:id", authenticate, restrict(["patient", "doctor"]), completeBooking);

export default router;