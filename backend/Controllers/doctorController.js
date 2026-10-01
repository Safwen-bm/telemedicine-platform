// Telemedecine\backend\Controllers\doctorController.js
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";

const TIME_ZONE = process.env.APP_TIMEZONE || "Africa/Tunis";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A doctor must never be able to change these through the profile form.
const PROTECTED_FIELDS = [
  "_id",
  "role",
  "isApproved",
  "reviews",
  "averageRating",
  "totalRating",
  "appointments",
];

export const updateDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    if (req.role !== "admin" && String(req.userId) !== id) {
      return res
        .status(403)
        .json({ success: false, message: "You can only update your own profile" });
    }

    const updateData = { ...req.body };
    for (const field of PROTECTED_FIELDS) delete updateData[field];

    if (typeof updateData.password === "string" && updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    } else {
      delete updateData.password;
    }

    const updated = await Doctor.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select(
      "-password"
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, message: "Doctor updated", data: updated });
  } catch (err) {
    console.error("Update doctor error:", err.message);
    res.status(500).json({ success: false, message: "Failed to update Doctor" });
  }
};

export const deleteDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    if (req.role !== "admin" && String(req.userId) !== id) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(200).json({ success: true, message: "Doctor deleted" });
  } catch (err) {
    console.error("Delete doctor error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete Doctor" });
  }
};

export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const doctor = await Doctor.findById(id).populate("reviews").select("-password");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.status(200).json({ success: true, message: "Doctor found", data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    const filter = req.role === "admin" ? {} : { isApproved: "approved" };

    if (query) {
      const pattern = { $regex: escapeRegex(query), $options: "i" };
      filter.$or = [{ name: pattern }, { specialization: pattern }];
    }

    const doctors = await Doctor.find(filter).select("-password");
    res.status(200).json({
      success: true,
      message: doctors.length ? "Doctors found" : "No doctors",
      data: doctors,
    });
  } catch (err) {
    console.error("Get doctors error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDoctorProfile = async (req, res) => {
  const doctorId = req.userId;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

    const { password, ...rest } = doctor.toObject();
    const appointments = await Booking.find({ doctor: doctorId }).populate(
      "user",
      "name email photo gender"
    );
    res
      .status(200)
      .json({ success: true, message: "Profile retrieved", data: { ...rest, appointments } });
  } catch (err) {
    console.error("Doctor profile error:", err.message);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};

// Kept in case Routes/doctor.js still imports it. The dashboard uses
// POST /bookings/notify/:id (bookingController) instead.
export const sendReminder = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("doctor", "name");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Only the doctor of this booking may send the reminder.
    if (String(booking.doctor?._id) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending appointments" });
    }
    if (!booking.user?.email) {
      return res.status(400).json({ success: false, message: "User email missing" });
    }

    const when = new Date(booking.appointmentDate);
    const dateLabel = when.toLocaleDateString("en-US", { timeZone: TIME_ZONE, dateStyle: "long" });
    const timeLabel = when.toLocaleTimeString("en-US", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const roomLink = `${process.env.CLIENT_SITE_URL}/consultation/${bookingId}`;

    await sgMail.send({
      to: booking.user.email,
      from: process.env.SENDGRID_FROM_EMAIL || "safwenbenmabrouk@gmail.com",
      subject: "Appointment Reminder",
      html: `<p>Hi ${booking.user.name}, your appointment with Dr. ${booking.doctor.name} is on ${dateLabel} at ${timeLabel}.</p>
             <p>Join the consultation here: <a href="${roomLink}">Click to Join</a></p>`,
    });

    res.status(200).json({ success: true, message: "Reminder sent" });
  } catch (err) {
    console.error("Send reminder error:", err.message);
    res.status(500).json({ success: false, message: "Reminder failed" });
  }
};

export const getPendingDoctors = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    const doctors = await Doctor.find({ isApproved: "pending" }).select("-password");
    res.status(200).json({ success: true, data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDoctorApproval = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    const { doctorId, status } = req.body;
    if (!["approved", "cancelled"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    doctor.isApproved = status;
    await doctor.save();
    res.status(200).json({ success: true, message: `Doctor ${status} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};