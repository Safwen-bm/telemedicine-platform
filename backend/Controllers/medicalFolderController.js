// Telemedecine\backend\Controllers\medicalFolderController.js
import MedicalFolder from "../models/MedicalFolderSchema.js";
import Booking from "../models/BookingSchema.js";
import MedicalNote from "../models/MedicalNoteSchema.js";
import User from "../models/UserSchema.js";

const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const bad = (res, message) => res.status(400).json({ success: false, message });

export const getMedicalFolder = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [patient, folder, appointments, medicalNotes] = await Promise.all([
      User.findById(patientId).select("name photo email dateOfBirth gender bloodType conditions"),
      MedicalFolder.findOne({ patient: patientId }).lean(),
      Booking.find({ user: patientId }).sort({ appointmentDate: -1 }),
      MedicalNote.find({ patient: patientId })
        .populate("doctor", "name specialization")
        .sort({ createdAt: -1 }),
    ]);

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        allergies: folder?.allergies || [],
        medications: folder?.medications || [],
        labResults: folder?.labResults || [],
        updatedAt: folder?.updatedAt,
        patient,
        appointments,
        medicalNotes,
      },
    });
  } catch (err) {
    console.error("Error fetching medical folder:", err.message);
    res.status(500).json({ success: false, message: "Failed to load the medical folder" });
  }
};

// One record per request: { allergy } or { medication } or { labResult }.
export const updateMedicalFolder = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { allergy, medication, labResult } = req.body || {};

    if (!(await User.countDocuments({ _id: patientId }))) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    let push;
    let message;

    if (allergy !== undefined) {
      const value = text(allergy, 100);
      if (!value) return bad(res, "Allergy is required");

      const existing = await MedicalFolder.findOne({ patient: patientId })
        .select("allergies")
        .lean();
      if ((existing?.allergies || []).some((a) => a.toLowerCase() === value.toLowerCase())) {
        return bad(res, "This allergy is already listed");
      }
      push = { allergies: value };
      message = "Allergy added";
    } else if (medication !== undefined) {
      const name = text(medication?.name, 100);
      const dosage = text(medication?.dosage, 100);
      const startDate = toDate(medication?.startDate);
      const endDate = toDate(medication?.endDate);

      if (!name || !dosage || !startDate) {
        return bad(res, "Name, dosage and start date are required");
      }
      if (medication?.endDate && !endDate) return bad(res, "Invalid end date");
      if (endDate && endDate < startDate) {
        return bad(res, "The end date cannot be before the start date");
      }
      push = { medications: { name, dosage, startDate, ...(endDate ? { endDate } : {}) } };
      message = "Medication added";
    } else if (labResult !== undefined) {
      const testName = text(labResult?.testName, 100);
      const result = text(labResult?.result, 300);
      const date = toDate(labResult?.date);

      if (!testName || !result || !date) {
        return bad(res, "Test name, result and date are required");
      }
      if (date > new Date()) return bad(res, "The test date cannot be in the future");
      push = { labResults: { testName, result, date } };
      message = "Lab result added";
    } else {
      return bad(res, "No valid updates provided");
    }

    const folder = await MedicalFolder.findOneAndUpdate(
      { patient: patientId },
      { $push: push },
      { new: true, upsert: true, runValidators: true }
    );

    res
      .status(200)
      .json({ success: true, message, data: { updatedAt: folder.updatedAt } });
  } catch (err) {
    console.error("Error updating medical folder:", err.message);
    res.status(500).json({ success: false, message: "Error updating medical folder" });
  }
};