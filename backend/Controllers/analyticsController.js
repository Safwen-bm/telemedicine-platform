import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";

const TIME_ZONE = process.env.APP_TIMEZONE || "Africa/Tunis";
const TREND_MONTHS = 12;

const forbidden = (res) =>
  res.status(403).json({ success: false, message: "Unauthorized access" });

export const getAnalytics = async (req, res) => {
  try {
    if (req.role !== "admin") return forbidden(res);

    const [
      totalDoctors,
      approvedDoctors,
      pendingDoctors,
      totalPatients,
      byStatus,
      revenueRows,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ isApproved: "approved" }),
      Doctor.countDocuments({ isApproved: "pending" }),
      User.countDocuments({ role: "patient" }),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      // Cancelled bookings are refunded, so they are not revenue.
      Booking.aggregate([
        { $match: { isPaid: true, status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: null,
            total: {
              $sum: { $convert: { input: "$ticketPrice", to: "double", onError: 0, onNull: 0 } },
            },
          },
        },
      ]),
    ]);

    const bookingsByStatus = { pending: 0, approved: 0, completed: 0, cancelled: 0 };
    for (const row of byStatus) {
      if (row._id in bookingsByStatus) bookingsByStatus[row._id] = row.count;
    }
    const totalBookings = Object.values(bookingsByStatus).reduce((a, b) => a + b, 0);

    res.status(200).json({
      success: true,
      data: {
        totalDoctors,
        approvedDoctors,
        pendingDoctors,
        totalPatients,
        totalBookings,
        bookingsByStatus,
        revenue: Math.round((revenueRows[0]?.total || 0) * 100) / 100,
      },
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookingTrends = async (req, res) => {
  try {
    if (req.role !== "admin") return forbidden(res);

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - (TREND_MONTHS - 1), 1);

    const rows = await Booking.aggregate([
      { $match: { status: { $ne: "cancelled" }, appointmentDate: { $gte: start } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m", date: "$appointmentDate", timezone: TIME_ZONE },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const counts = new Map(rows.map((r) => [r._id, r.count]));

    const labels = [];
    const data = [];
    for (let i = 0; i < TREND_MONTHS; i += 1) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      labels.push(key);
      data.push(counts.get(key) || 0);
    }

    res.status(200).json({ success: true, data: { labels, data } });
  } catch (err) {
    console.error("Booking trends error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};