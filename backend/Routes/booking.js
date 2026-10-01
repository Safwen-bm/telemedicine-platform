import express from "express";
import { authenticate, restrict } from "./../auth/verifyToken.js";
import {
  getCheckoutSession,
  confirmCheckout,
  getAllBookings,
  getBookingById,
  sendReminder,
  cancelBooking,
  completeBooking,
} from "../Controllers/bookingController.js";

const router = express.Router();

router.post(
  "/checkout-session/:doctorId",
  authenticate,
  restrict(["patient"]),
  getCheckoutSession,
);
router.post("/confirm", authenticate, restrict(["patient"]), confirmCheckout);
router.get("/", authenticate, restrict(["admin"]), getAllBookings);
router.get(
  "/:id",
  authenticate,
  restrict(["patient", "doctor"]),
  getBookingById,
);
router.post(
  "/notify/:id",
  authenticate,
  restrict(["patient", "doctor"]),
  sendReminder,
);
router.delete(
  "/cancel/:id",
  authenticate,
  restrict(["admin", "patient", "doctor"]),
  cancelBooking,
);
router.patch(
  "/complete/:id",
  authenticate,
  restrict(["patient", "doctor"]),
  completeBooking,
);

export default router;
