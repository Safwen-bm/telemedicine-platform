import mongoose from "mongoose";
import Doctor from "./DoctorSchema.js";

const reviewSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  { timestamps: true }
);

// Populate user details before find queries
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

// Recomputes a doctor's rating. Handles a doctor with no reviews left.
reviewSchema.statics.calcAverageRatings = async function (doctorId) {
  const stats = await this.aggregate([
    { $match: { doctor: new mongoose.Types.ObjectId(String(doctorId)) } },
    {
      $group: {
        _id: "$doctor",
        numOfRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Doctor.findByIdAndUpdate(doctorId, {
    totalRating: stats[0]?.numOfRating || 0,
    averageRating: stats[0] ? Math.round(stats[0].avgRating * 10) / 10 : 0,
  });
};

export default mongoose.model("Review", reviewSchema);