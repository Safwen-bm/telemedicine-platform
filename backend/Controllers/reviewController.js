import mongoose from "mongoose";
import Review from "../models/ReviewSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";

const bad = (res, message, status = 400) => res.status(status).json({ success: false, message });

// Reviews of one doctor (nested route), or all reviews on the plain route.
export const getAllReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.params.doctorId) {
      if (!mongoose.isValidObjectId(req.params.doctorId)) return bad(res, "Doctor not found", 404);
      filter.doctor = req.params.doctorId;
    }

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: "Successful", data: reviews });
  } catch (err) {
    console.error("Get reviews error:", err.message);
    res.status(500).json({ success: false, message: "Failed to load reviews" });
  }
};

export const createReview = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reviewText, rating } = req.body || {};

    if (!mongoose.isValidObjectId(doctorId)) return bad(res, "Doctor not found", 404);

    const text = typeof reviewText === "string" ? reviewText.trim() : "";
    const stars = Number(rating);
    if (!text) return bad(res, "Please write a short comment");
    if (text.length > 1000) return bad(res, "Your comment must be 1000 characters or fewer");
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return bad(res, "Rating must be between 1 and 5");
    }

    if (!(await Doctor.findById(doctorId).select("_id"))) return bad(res, "Doctor not found", 404);

    // Only patients who actually had a consultation with this doctor can review.
    const completed = await Booking.findOne({
      user: req.userId,
      doctor: doctorId,
      status: "completed",
    });
    if (!completed) {
      return bad(res, "You can review a doctor after a completed consultation", 403);
    }

    if (await Review.findOne({ doctor: doctorId, user: req.userId })) {
      return bad(res, "You have already reviewed this doctor", 409);
    }

    // doctor and user come from the URL and the token, never from the body.
    const review = await Review.create({
      doctor: doctorId,
      user: req.userId,
      reviewText: text,
      rating: stars,
    });

    await Doctor.findByIdAndUpdate(doctorId, { $addToSet: { reviews: review._id } });
    await Review.calcAverageRatings(doctorId);

    res.status(201).json({ success: true, message: "Review submitted", data: review });
  } catch (err) {
    console.error("Create review error:", err.message);
    res.status(500).json({ success: false, message: "Failed to submit your review" });
  }
};