import MedicalFolder from "../models/MedicalFolderSchema.js";
import Booking from "../models/BookingSchema.js";
import MedicalNote from "../models/MedicalNoteSchema.js";

export const getMedicalFolder = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Fetch all bookings and medical notes for the patient
    const appointments = await Booking.find({ user: patientId });
    const medicalNotes = await MedicalNote.find({ patient: patientId });

    // Find or create the MedicalFolder
    let medicalFolder = await MedicalFolder.findOne({ patient: patientId });
    if (!medicalFolder) {
      medicalFolder = await MedicalFolder.create({
        patient: patientId,
        appointments: appointments.map(a => a._id),
        medicalNotes: medicalNotes.map(n => n._id),
      });
    } else {
      // Update appointments and medicalNotes arrays
      medicalFolder.appointments = appointments.map(a => a._id);
      medicalFolder.medicalNotes = medicalNotes.map(n => n._id);
      await medicalFolder.save();
    }

    // Fetch the updated MedicalFolder with populated fields
    medicalFolder = await MedicalFolder.findOne({ patient: patientId })
      .populate("patient", "name photo email dateOfBirth gender bloodType conditions")
      .populate({
        path: "appointments",
        populate: { path: "doctor", select: "name specialization" },
      })
      .populate({
        path: "medicalNotes",
        populate: { path: "doctor", select: "name specialization" },
      });

    if (!medicalFolder) {
      return res.status(404).json({ success: false, message: "Medical folder not found after creation" });
    }

    res.status(200).json({ success: true, data: medicalFolder });
  } catch (err) {
    console.error("Error fetching medical folder:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMedicalFolder = async (req, res) => {
  try {
    const { patientId } = req.params;
    const updates = req.body;

    // Fetch all bookings and medical notes to ensure they're up-to-date
    const appointments = await Booking.find({ user: patientId });
    const medicalNotes = await MedicalNote.find({ patient: patientId });

    let medicalFolder = await MedicalFolder.findOne({ patient: patientId });
    if (!medicalFolder) {
      medicalFolder = await MedicalFolder.create({
        patient: patientId,
        appointments: appointments.map(a => a._id),
        medicalNotes: medicalNotes.map(n => n._id),
      });
    } else {
      // Ensure appointments and medicalNotes are up-to-date
      medicalFolder.appointments = appointments.map(a => a._id);
      medicalFolder.medicalNotes = medicalNotes.map(n => n._id);
    }

    // Handle array updates using $push
    const updateOperations = {};
    if (updates.$push?.allergies) {
      updateOperations.$push = updateOperations.$push || {};
      updateOperations.$push.allergies = updates.$push.allergies;
    }
    if (updates.$push?.medications) {
      updateOperations.$push = updateOperations.$push || {};
      updateOperations.$push.medications = updates.$push.medications;
    }
    if (updates.$push?.labResults) {
      updateOperations.$push = updateOperations.$push || {};
      updateOperations.$push.labResults = updates.$push.labResults;
    }

    if (Object.keys(updateOperations).length === 0) {
      return res.status(400).json({ success: false, message: "No valid updates provided" });
    }

    medicalFolder = await MedicalFolder.findOneAndUpdate(
      { patient: patientId },
      updateOperations,
      { new: true, runValidators: true }
    )
      .populate("patient", "name photo email dateOfBirth gender bloodType conditions")
      .populate({
        path: "appointments",
        populate: { path: "doctor", select: "name specialization" },
      })
      .populate({
        path: "medicalNotes",
        populate: { path: "doctor", select: "name specialization" },
      });

    if (!medicalFolder) {
      return res.status(404).json({ success: false, message: "Medical folder not found after update" });
    }

    res.status(200).json({ success: true, message: "Medical folder updated successfully", data: medicalFolder });
  } catch (err) {
    console.error("Error updating medical folder:", err);
    res.status(500).json({ success: false, message: "Error updating medical folder", error: err.message });
  }
};