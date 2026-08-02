import express from "express";
import {
  updateDoctor,
  deleteDoctor,
  getAllDoctors,
  getSingleDoctor,
  getDoctorProfile,
  sendReminder,
  getPendingDoctors,
  updateDoctorApproval,
} from "../Controllers/doctorController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";
import reviewRouter from "./review.js";

const router = express.Router();

// Wrap async middleware and handlers in a function to handle Promises
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Routes
// Nested route for reviews
router.use("/:doctorId/reviews", reviewRouter);

// Public route to get all approved doctors (for patients to browse)
router.get("/", asyncHandler(getAllDoctors));

// Public route to get a single doctor by ID
router.get("/:id", asyncHandler(getSingleDoctor));

// Protected route to get doctor's own profile
router.get(
  "/profile/me",
  asyncHandler(authenticate),
  asyncHandler(restrict(["doctor"])),
  asyncHandler(getDoctorProfile)
);

// Protected route for doctor to update their own profile
router.put(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(restrict(["doctor"])),
  asyncHandler(updateDoctor)
);

// Protected route for doctor to delete their own account
router.delete(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(restrict(["doctor"])),
  asyncHandler(deleteDoctor)
);

// Protected route for doctor to send reminders
router.post(
  "/appointments/:bookingId/send-reminder",
  asyncHandler(authenticate),
  asyncHandler(restrict(["doctor"])),
  asyncHandler(sendReminder)
);

// Protected route for admin to get all doctors
router.get(
  "/admin/doctors",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(getAllDoctors)
);

// Protected route for admin to get pending doctors
router.get(
  "/pending",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(getPendingDoctors)
);

// Protected route for admin to approve/reject doctors
router.patch(
  "/approve",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(updateDoctorApproval)
);

export default router;

{/*µOther Admin Responsibilities
Manage Users: View, edit, or delete patient profiles.
Manage Bookings: Already implemented (view/cancel bookings).
Analytics: View stats (e.g., total doctors, patients, bookings).
Moderation: Delete inappropriate doctor reviews.
Notifications: Send reminders or announcements to users/doctors*/}