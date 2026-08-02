import MedicalNote from "../models/MedicalNoteSchema.js";
import Booking from "../models/BookingSchema.js";
import MedicalFolder from "../models/MedicalFolderSchema.js";

export const createMedicalNote = async (req, res) => {
  try {
    const { bookingId, diagnosis, treatment, notes } = req.body;
    const doctorId = req.userId;

    const booking = await Booking.findById(bookingId).populate("doctor");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.doctor._id.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ success: false, message: "Booking must be completed" });
    }

    const newNote = new MedicalNote({
      booking: bookingId,
      patient: booking.user,
      doctor: doctorId,
      diagnosis,
      treatment,
      notes,
    });
    await newNote.save();

    // Update MedicalFolder
    let medicalFolder = await MedicalFolder.findOne({ patient: booking.user });
    if (!medicalFolder) {
      const appointments = await Booking.find({ user: booking.user });
      medicalFolder = await MedicalFolder.create({
        patient: booking.user,
        appointments: appointments.map(a => a._id),
        medicalNotes: [newNote._id],
      });
    } else {
      if (!medicalFolder.medicalNotes.includes(newNote._id)) {
        medicalFolder.medicalNotes.push(newNote._id);
        await medicalFolder.save();
      }
    }

    res.status(201).json({ success: true, message: "Medical note created", data: newNote });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create medical note", error: error.message });
  }
};

export const getPatientMedicalNotes = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const userId = req.userId;

    if (userId !== patientId) {
      const booking = await Booking.findOne({ user: patientId, doctor: userId });
      if (!booking) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
      }
    }

    const notes = await MedicalNote.find({ patient: patientId })
      .populate("doctor", "name")
      .populate("booking", "appointmentDate status");
    res.status(200).json({ success: true, message: "Medical notes retrieved", data: notes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to retrieve medical notes", error: error.message });
  }
};

export const updateMedicalNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { diagnosis, treatment, notes } = req.body;
    const doctorId = req.userId;

    const note = await MedicalNote.findById(noteId).populate("doctor");
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    if (note.doctor._id.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    note.diagnosis = diagnosis || note.diagnosis;
    note.treatment = treatment || note.treatment;
    note.notes = notes || note.notes;
    await note.save();

    // Ensure MedicalFolder is up-to-date
    let medicalFolder = await MedicalFolder.findOne({ patient: note.patient });
    if (!medicalFolder) {
      const appointments = await Booking.find({ user: note.patient });
      medicalFolder = await MedicalFolder.create({
        patient: note.patient,
        appointments: appointments.map(a => a._id),
        medicalNotes: [note._id],
      });
    } else {
      if (!medicalFolder.medicalNotes.includes(note._id)) {
        medicalFolder.medicalNotes.push(note._id);
        await medicalFolder.save();
      }
    }

    res.status(200).json({ success: true, message: "Medical note updated", data: note });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update medical note", error: error.message });
  }
};

export const deleteMedicalNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const doctorId = req.userId;

    const note = await MedicalNote.findById(noteId).populate("doctor");
    if (!note) return res.status(404).json({ success: false, message: "Note not found" });
    if (note.doctor._id.toString() !== doctorId) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Remove the note from MedicalFolder
    await MedicalFolder.updateOne(
      { patient: note.patient },
      { $pull: { medicalNotes: noteId } }
    );

    await note.deleteOne();
    res.status(200).json({ success: true, message: "Medical note deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete medical note", error: error.message });
  }
};