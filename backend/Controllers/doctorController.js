// Telemedecine\backend\Controllers\doctorController.js
import bcrypt from "bcryptjs";
import sgMail from "@sendgrid/mail";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import MedicalNote from "../models/MedicalNoteSchema.js";
import Review from "../models/ReviewSchema.js";

const TIME_ZONE = process.env.APP_TIMEZONE || "Africa/Tunis";

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// A doctor can only change these through the profile form.
// Never add email, role, isApproved, ratings or reviews here.
const UPDATABLE_FIELDS = [
  "name",
  "phone",
  "bio",
  "gender",
  "specialization",
  "ticketPrice",
  "qualifications",
  "experiences",
  "about",
  "photo",
];
const REQUIRED_FIELDS = ["name"];

const bad = (res, message) => res.status(400).json({ success: false, message });

export const updateDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    if (req.role !== "admin" && String(req.userId) !== id) {
      return res
        .status(403)
        .json({ success: false, message: "You can only update your own profile" });
    }

    const set = {};
    const unset = {};
    for (const field of UPDATABLE_FIELDS) {
      const value = req.body[field];
      if (value === undefined) continue;

      // An empty optional field means "clear it". Saving "" would break the
      // enum validation later (for example when an admin approves the doctor).
      if (value === "" || value === null) {
        if (REQUIRED_FIELDS.includes(field)) return bad(res, `${field} is required`);
        unset[field] = "";
      } else {
        set[field] = value;
      }
    }

    if (set.name !== undefined) {
      set.name = String(set.name).trim();
      if (!set.name) return bad(res, "name is required");
    }
    if (set.bio !== undefined && String(set.bio).length > 100) {
      return bad(res, "Bio must be 100 characters or fewer");
    }
    if (set.ticketPrice !== undefined) {
      set.ticketPrice = Number(set.ticketPrice);
      if (!Number.isFinite(set.ticketPrice) || set.ticketPrice < 0) {
        return bad(res, "Consultation fee must be a positive number");
      }
    }
    for (const key of ["qualifications", "experiences"]) {
      if (set[key] !== undefined && !Array.isArray(set[key])) {
        return bad(res, `${key} must be a list`);
      }
    }

    if (typeof req.body.password === "string" && req.body.password) {
      set.password = await bcrypt.hash(req.body.password, 10);
    }

    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;

    const updated = await Doctor.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    res.status(200).json({ success: true, message: "Doctor updated", data: updated });
  } catch (err) {
    if (err.name === "ValidationError") return bad(res, err.message);
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

    // Patients have paid for pending appointments, so those must be dealt with first.
    const pending = await Booking.countDocuments({ doctor: id, status: "pending" });
    if (pending > 0) {
      return bad(
        res,
        `You still have ${pending} pending appointment${pending > 1 ? "s" : ""}. Complete or cancel ${
          pending > 1 ? "them" : "it"
        } before deleting your account.`
      );
    }

    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    await Review.deleteMany({ doctor: id });
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

    const [bookings, notes] = await Promise.all([
      Booking.find({ doctor: doctorId }).populate("user", "name email photo gender"),
      MedicalNote.find({ doctor: doctorId }).select("_id booking"),
    ]);

    // The dashboard needs to know which appointments already have a note.
    const noteByBooking = new Map(notes.map((n) => [String(n.booking), String(n._id)]));
    const appointments = bookings.map((b) => ({
      ...b.toObject(),
      noteId: noteByBooking.get(String(b._id)) || null,
    }));

    res
      .status(200)
      .json({ success: true, message: "Profile retrieved", data: { ...rest, appointments } });
  } catch (err) {
    console.error("Doctor profile error:", err.message);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};

// Kept because Routes/doctor.js imports it. The dashboard uses
// POST /bookings/notify/:id (bookingController) instead.
export const sendReminder = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("doctor", "name");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

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