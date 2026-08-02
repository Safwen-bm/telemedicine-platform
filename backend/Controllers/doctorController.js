import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const updateDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const updateDoctor = await Doctor.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.status(200).json({ success: true, message: "Doctor updated", data: updateDoctor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update Doctor", error: err.message });
  }
};

export const deleteDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    await Doctor.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete Doctor", error: err.message });
  }
};

export const getSingleDoctor = async (req, res) => {
  const id = req.params.id;
  try {
    const doctor = await Doctor.findById(id).populate("reviews").select("-password");
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    res.status(200).json({ success: true, message: "Doctor found", data: doctor });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getAllDoctors = async (req, res) => {
  try {
    const { query } = req.query;
    let doctors;
    if (req.role === "admin") {
      doctors = query
        ? await Doctor.find({ $or: [{ name: { $regex: query, $options: "i" } }, { specialization: { $regex: query, $options: "i" } }] }).select("-password")
        : await Doctor.find().select("-password");
    } else {
      doctors = query
        ? await Doctor.find({ isApproved: "approved", $or: [{ name: { $regex: query, $options: "i" } }, { specialization: { $regex: query, $options: "i" } }] }).select("-password")
        : await Doctor.find({ isApproved: "approved" }).select("-password");
    }
    res.status(200).json({ success: true, message: doctors.length ? "Doctors found" : "No doctors", data: doctors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

export const getDoctorProfile = async (req, res) => {
  const doctorId = req.userId;
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
    const { password, ...rest } = doctor._doc;
    const appointments = await Booking.find({ doctor: doctorId }).populate("user", "name email photo gender");
    res.status(200).json({ success: true, message: "Profile retrieved", data: { ...rest, appointments } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal error", error: err.message });
  }
};

export const sendReminder = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findById(bookingId)
      .populate("user", "name email")
      .populate("doctor", "name");
    console.log("Checking booking:", booking);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    if (booking.status !== "pending") return res.status(400).json({ success: false, message: "Only pending appointments" });

    if (!booking.user?.email) {
      console.log("No email for user:", booking.user);
      return res.status(400).json({ success: false, message: "User email missing" });
    }

    const roomLink = `${process.env.CLIENT_SITE_URL}/consultation/${bookingId}`;
    const appointmentTime = booking.appointmentDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const msg = {
      to: booking.user.email,
      from: "safwenbenmabrouk@gmail.com",
      subject: "Appointment Reminder",
      html: `<p>Hi ${booking.user.name}, your appointment with Dr. ${booking.doctor.name} is on ${new Date(booking.appointmentDate).toLocaleDateString()} at ${appointmentTime}.</p>
             <p>Join the consultation here: <a href="${roomLink}">Click to Join</a></p>`,
    };

    const sendGridResponse = await sgMail.send(msg);
    console.log("SendGrid response:", sendGridResponse);
    console.log(`Reminder sent to ${booking.user.email} for ${bookingId}`);
    res.status(200).json({ success: true, message: "Reminder sent" });
  } catch (err) {
    console.error("Send reminder error:", err.message, err.stack);
    res.status(500).json({ success: false, message: "Reminder failed", error: err.message });
  }
};

export const getPendingDoctors = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    const doctors = await Doctor.find({ isApproved: "pending" });
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