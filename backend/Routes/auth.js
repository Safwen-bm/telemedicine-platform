import express from "express";
import { register, login } from "../Controllers/authController.js";
import { rateLimit } from "../auth/rateLimit.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: (req) => `login:${req.ip}:${String(req.body?.email || "").trim().toLowerCase()}`,
  message: "Too many login attempts. Please try again in a few minutes.",
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  key: (req) => `register:${req.ip}`,
  message: "Too many sign-ups from this network. Please try again later.",
});

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);

export default router;