import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";

export const getAnalytics = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: "patient" });
    const totalBookings = await Booking.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        totalPatients,
        totalBookings,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookingTrends = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const bookings = await Booking.aggregate([
      // Match only bookings with a valid appointmentDate
      { $match: { appointmentDate: { $ne: null, $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$appointmentDate" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const labels = bookings.map((b) => b._id);
    const data = bookings.map((b) => b.count);

    res.status(200).json({
      success: true,
      data: { labels, data },
    });
  } catch (err) {
    console.error("Booking trends error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};