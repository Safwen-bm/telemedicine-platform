import mongoose from "mongoose";

const medicalNoteSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    diagnosis: {
      type: String,
      required: true,
    },
    treatment: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("MedicalNote", medicalNoteSchema);