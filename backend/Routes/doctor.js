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

// Nested route for reviews
router.use("/:doctorId/reviews", reviewRouter);

// Public route to get all approved doctors (for patients to browse)
router.get("/", asyncHandler(getAllDoctors));

// Fixed routes MUST come before "/:id", otherwise "pending" is read as an id.
router.get(
  "/pending",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(getPendingDoctors)
);

router.get(
  "/profile/me",
  asyncHandler(authenticate),
  asyncHandler(restrict(["doctor"])),
  asyncHandler(getDoctorProfile)
);

router.get(
  "/admin/doctors",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(getAllDoctors)
);

router.patch(
  "/approve",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(updateDoctorApproval)
);

router.post(
  "/appointments/:bookingId/send-reminder",
  asyncHandler(authenticate),
  asyncHandler(restrict(["doctor"])),
  asyncHandler(sendReminder)
);

// Public route to get a single doctor by ID
router.get("/:id", asyncHandler(getSingleDoctor));

// Doctor updates / deletes their own account
router.put(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(restrict(["doctor"])),
  asyncHandler(updateDoctor)
);

router.delete(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(restrict(["doctor"])),
  asyncHandler(deleteDoctor)
);

export default router;