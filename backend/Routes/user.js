import express from "express";
import {
  updateUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  getUserProfile,
  getMyAppointments,
} from "../Controllers/userController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(restrict(["patient", "doctor"])),
  asyncHandler(getSingleUser)
);
router.get(
  "/admin/patients",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(getAllUsers)
);
router.put(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(restrict(["patient"])),
  asyncHandler(updateUser)
);
router.delete(
  "/:id",
  asyncHandler(authenticate),
  asyncHandler(restrict(["patient", "admin"])), // Allow admin to delete
  asyncHandler(deleteUser)
);
router.get(
  "/profile/me",
  asyncHandler(authenticate),
  asyncHandler(restrict(["patient"])),
  asyncHandler(getUserProfile)
);
router.get(
  "/appointments/my-appointments",
  asyncHandler(authenticate),
  asyncHandler(restrict(["patient"])),
  asyncHandler(getMyAppointments)
);

export default router;