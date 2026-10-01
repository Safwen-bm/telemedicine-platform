//Telemedecine\backend\Controllers\medicalNoteController.js
import mongoose from "mongoose";
import MedicalNote from "../models/MedicalNoteSchema.js";
import Booking from "../models/BookingSchema.js";

const LIMITS = { diagnosis: 500, treatment: 1000, notes: 5000 };

// Works whether the field is populated (an object) or a raw id, and when it is null.
const idOf = (ref) => (ref?._id ?? ref)?.toString();

const bad = (res, message, status = 400) => res.status(status).json({ success: false, message });

const str = (value) => (typeof value === "string" ? value.trim() : "");

const lengthError = (field, value) =>
  value.length > LIMITS[field] ? `${field} must be ${LIMITS[field]} characters or fewer` : null;

export const createMedicalNote = async (req, res) => {
  try {
    const { bookingId, diagnosis, treatment, notes } = req.body || {};

    if (!mongoose.isValidObjectId(bookingId)) return bad(res, "A valid booking is required");

    const booking = await Booking.findById(bookingId);
    if (!booking) return bad(res, "Booking not found", 404);
    if (idOf(booking.doctor) !== String(req.userId)) return bad(res, "Unauthorized access", 403);
    if (booking.status !== "completed") return bad(res, "Booking must be completed");

    const patientId = idOf(booking.user);
    if (!patientId) return bad(res, "The patient account no longer exists", 404);

    const d = str(diagnosis);
    const t = str(treatment);
    const n = str(notes);
    if (!d || !t) return bad(res, "Diagnosis and treatment are required");

    const tooLong = lengthError("diagnosis", d) || lengthError("treatment", t) || lengthError("notes", n);
    if (tooLong) return bad(res, tooLong);

    // One note per appointment. A double click must not create two.
    if (await MedicalNote.findOne({ booking: booking._id })) {
      return bad(res, "A note already exists for this appointment", 409);
    }

    const note = await MedicalNote.create({
      booking: booking._id,
      patient: patientId,
      doctor: req.userId,
      diagnosis: d,
      treatment: t,
      notes: n || undefined,
    });

    res.status(201).json({ success: true, message: "Medical note created", data: note });
  } catch (error) {
    console.error("Create medical note error:", error.message);
    res.status(500).json({ success: false, message: "Failed to create medical note" });
  }
};

export const getPatientMedicalNotes = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!mongoose.isValidObjectId(patientId)) return bad(res, "Patient not found", 404);

    const userId = String(req.userId);
    if (userId !== patientId) {
      // A doctor may read the notes of a patient they have a booking with.
      if (req.role !== "doctor") return bad(res, "Unauthorized access", 403);

      const booking = await Booking.findOne({
        user: patientId,
        doctor: userId,
        status: { $ne: "cancelled" },
      });
      if (!booking) return bad(res, "Unauthorized access", 403);
    }

    const notes = await MedicalNote.find({ patient: patientId })
      .populate("doctor", "name specialization")
      .populate("booking", "appointmentDate status")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: "Medical notes retrieved", data: notes });
  } catch (error) {
    console.error("Get medical notes error:", error.message);
    res.status(500).json({ success: false, message: "Failed to retrieve medical notes" });
  }
};

export const updateMedicalNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    if (!mongoose.isValidObjectId(noteId)) return bad(res, "Note not found", 404);

    const note = await MedicalNote.findById(noteId);
    if (!note) return bad(res, "Note not found", 404);
    if (idOf(note.doctor) !== String(req.userId)) return bad(res, "Unauthorized access", 403);

    const { diagnosis, treatment, notes } = req.body || {};

    if (diagnosis !== undefined) {
      const v = str(diagnosis);
      if (!v) return bad(res, "Diagnosis cannot be empty");
      const err = lengthError("diagnosis", v);
      if (err) return bad(res, err);
      note.diagnosis = v;
    }
    if (treatment !== undefined) {
      const v = str(treatment);
      if (!v) return bad(res, "Treatment cannot be empty");
      const err = lengthError("treatment", v);
      if (err) return bad(res, err);
      note.treatment = v;
    }
    if (notes !== undefined) {
      // Optional field: an empty value clears it (it used to be impossible).
      const v = str(notes);
      const err = lengthError("notes", v);
      if (err) return bad(res, err);
      note.notes = v;
    }

    await note.save();
    res.status(200).json({ success: true, message: "Medical note updated", data: note });
  } catch (error) {
    console.error("Update medical note error:", error.message);
    res.status(500).json({ success: false, message: "Failed to update medical note" });
  }
};

export const deleteMedicalNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    if (!mongoose.isValidObjectId(noteId)) return bad(res, "Note not found", 404);

    const note = await MedicalNote.findById(noteId);
    if (!note) return bad(res, "Note not found", 404);
    if (idOf(note.doctor) !== String(req.userId)) return bad(res, "Unauthorized access", 403);

    await note.deleteOne();
    res.status(200).json({ success: true, message: "Medical note deleted" });
  } catch (error) {
    console.error("Delete medical note error:", error.message);
    res.status(500).json({ success: false, message: "Failed to delete medical note" });
  }
};