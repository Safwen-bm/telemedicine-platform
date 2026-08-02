import express from "express";
import { authenticate, restrict } from "../auth/verifyToken.js";
import { createOrJoinRoom, getRoom, endRoom } from "../Controllers/consultationRoomController.js";

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/:bookingId/join",
  asyncHandler(authenticate),
  asyncHandler(restrict(["patient", "doctor"])),
  asyncHandler(createOrJoinRoom)
);
router.get(
  "/:bookingId",
  asyncHandler(authenticate),
  asyncHandler(restrict(["patient", "doctor"])),
  asyncHandler(getRoom)
);
router.post(
  "/end",
  asyncHandler(authenticate),
  asyncHandler(restrict(["patient", "doctor"])),
  asyncHandler(endRoom)
);

export default router;