import express from "express";
import { loginAdmin } from "../Controllers/adminController.js";

const router = express.Router();

router.post("/login", loginAdmin);

export default router;