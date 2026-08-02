import express from "express";
import {
  getMedicalFolder,
  updateMedicalFolder,
} from "../Controllers/medicalFolderController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

router.get(
  "/:patientId",
  authenticate,
  async (req, res, next) => {
    const { patientId } = req.params;
    const userId = req.userId;
    const userRole = req.role;

    console.log("MedicalFolder Middleware - Values:", {
      userId,
      patientId,
      userRole,
      isUserPatient: userId === patientId,
      isUserDoctor: userRole === "doctor",
      conditionResult: userId !== patientId && userRole !== "doctor",
    });

    if (userId !== patientId && userRole !== "doctor") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    next();
  },
  getMedicalFolder
);

router.patch(
  "/:patientId",
  authenticate,
  restrict(["doctor"]),
  updateMedicalFolder
);

export default router;