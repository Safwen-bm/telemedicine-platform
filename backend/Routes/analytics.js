import express from "express";
import { getAnalytics, getBookingTrends } from "../Controllers/analyticsController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.get(
  "/dashboard",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(getAnalytics)
);

router.get(
  "/booking-trends",
  asyncHandler(authenticate),
  asyncHandler(restrict(["admin"])),
  asyncHandler(getBookingTrends)
);

export default router;