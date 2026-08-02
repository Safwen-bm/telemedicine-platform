import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticketPrice: { type: String, required: true },
    appointmentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled", "completed"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Remove or adjust the pre-find hook to avoid overriding custom population
bookingSchema.pre(/^find/, function (next) {
  this.populate("user");
  this.populate({ path: "doctor", select: "name photo specialization averageRating totalRating experiences" });
  next();
});

export default mongoose.model("Booking", bookingSchema);