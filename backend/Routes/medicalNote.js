import express from "express";
import {
  createMedicalNote,
  getPatientMedicalNotes,
  updateMedicalNote,
  deleteMedicalNote,
} from "../Controllers/medicalNoteController.js";
import { authenticate, restrict } from "../auth/verifyToken.js";

const router = express.Router();

router.post("/", authenticate, restrict(["doctor"]), createMedicalNote);
router.get(
  "/patient/:patientId",
  authenticate,
  restrict(["patient", "doctor"]),
  getPatientMedicalNotes
);
router.put("/:noteId", authenticate, restrict(["doctor"]), updateMedicalNote);
router.delete("/:noteId", authenticate, restrict(["doctor"]), deleteMedicalNote);

export default router;