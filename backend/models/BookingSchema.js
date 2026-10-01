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
      default: false,
    },
    // Set when Stripe confirms the payment. The unique index also prevents
    // the same payment from creating two bookings.
    stripeSessionId: { type: String, unique: true, sparse: true },
    paymentIntentId: { type: String },
  },
  { timestamps: true }
);

bookingSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "-password" });
  this.populate({
    path: "doctor",
    select: "name photo specialization averageRating totalRating experiences",
  });
  next();
});

export default mongoose.model("Booking", bookingSchema);