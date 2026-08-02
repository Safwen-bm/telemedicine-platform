import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
});

const labResultSchema = new mongoose.Schema({
  testName: { type: String, required: true },
  result: { type: String, required: true },
  date: { type: Date, required: true },
});

const medicalFolderSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    appointments: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
    medicalNotes: [{ type: mongoose.Types.ObjectId, ref: "MedicalNote" }],
    allergies: [{ type: String }],
    medications: [medicationSchema],
    labResults: [labResultSchema],
  },
  { timestamps: true }
);

export default mongoose.model("MedicalFolder", medicalFolderSchema);