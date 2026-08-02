import mongoose from "mongoose";

const consultationRoomSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true, // Ensure one room per booking
  },
  participants: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      peerId: { type: String, required: true },
    },
  ],
  ended: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("ConsultationRoom", consultationRoomSchema);