import express from "express";
import { loginAdmin } from "../Controllers/adminController.js";
import { rateLimit } from "../auth/rateLimit.js";

const router = express.Router();

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  key: (req) => `admin-login:${req.ip}`,
  message: "Too many attempts. Please try again in a few minutes.",
});

router.post("/login", adminLoginLimiter, loginAdmin);

export default router;