// Telemedecine\backend\Controllers\userController.js
import bcrypt from "bcryptjs";
import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import MedicalNote from "../models/MedicalNoteSchema.js";
import MedicalFolder from "../models/MedicalFolderSchema.js";
import Review from "../models/ReviewSchema.js";
import Doctor from "../models/DoctorSchema.js";

// Only these fields can be changed through the profile form.
// Never add role, email or password here (password is handled separately).
const UPDATABLE_FIELDS = ["name", "photo", "gender", "dateOfBirth", "bloodType", "conditions", "phone"];
const REQUIRED_FIELDS = ["name"];

export const updateUser = async (req, res) => {
  const id = req.params.id;
  try {
    if (String(req.userId) !== id) {
      return res
        .status(403)
        .json({ success: false, message: "You can only update your own profile" });
    }

    const set = {};
    const unset = {};
    for (const field of UPDATABLE_FIELDS) {
      const value = req.body[field];
      if (value === undefined) continue;

      // An empty optional field means "clear it". Saving "" would later fail
      // the enum validation on gender.
      if (value === "" || value === null) {
        if (REQUIRED_FIELDS.includes(field)) {
          return res.status(400).json({ success: false, message: `${field} is required` });
        }
        unset[field] = "";
      } else {
        set[field] = value;
      }
    }

    if (set.name !== undefined) {
      set.name = String(set.name).trim();
      if (!set.name) {
        return res.status(400).json({ success: false, message: "name is required" });
      }
    }
    if (set.conditions !== undefined) {
      if (!Array.isArray(set.conditions)) {
        return res.status(400).json({ success: false, message: "conditions must be a list" });
      }
      set.conditions = set.conditions.map((c) => String(c).trim()).filter(Boolean);
    }
    if (set.dateOfBirth && new Date(set.dateOfBirth) > new Date()) {
      return res
        .status(400)
        .json({ success: false, message: "Date of birth cannot be in the future" });
    }

    if (typeof req.body.password === "string" && req.body.password) {
      set.password = await bcrypt.hash(req.body.password, 10);
    }

    const update = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;

    const updatedUser = await User.findByIdAndUpdate(id, update, { new: true }).select(
      "-password"
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User successfully updated",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Update user error:", err.message);
    res.status(500).json({ success: false, message: "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    if (req.role !== "admin" && String(req.userId) !== id) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Reviews written by this patient, and the doctors they affect.
    const reviews = await Review.find({ user: id }).select("doctor").lean();
    const reviewIds = reviews.map((r) => r._id);
    const doctorIds = [...new Set(reviews.map((r) => String(r.doctor)))];

    await Promise.all([
      Booking.deleteMany({ user: id }),
      MedicalNote.deleteMany({ patient: id }),
      MedicalFolder.deleteMany({ patient: id }),
      Review.deleteMany({ user: id }),
    ]);

    if (doctorIds.length) {
      await Doctor.updateMany(
        { _id: { $in: doctorIds } },
        { $pull: { reviews: { $in: reviewIds } } }
      );
      await Promise.all(doctorIds.map((doctorId) => Review.calcAverageRatings(doctorId)));
    }

    res.status(200).json({ success: true, message: "User successfully deleted" });
  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

export const getSingleUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isSelf = String(req.userId) === id;
    if (!isSelf) {
      // Only a doctor who has a booking with this patient may read the record.
      if (req.role !== "doctor") {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
      }
      const booking = await Booking.findOne({ user: id, doctor: req.userId });
      if (!booking) {
        return res.status(403).json({ success: false, message: "Unauthorized access" });
      }
    }

    res.status(200).json({ success: true, message: "User found", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    if (req.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    const users = await User.find({ role: "patient" }).select("-password");
    res.status(200).json({
      success: true,
      message: users.length > 0 ? "Patients found" : "No patients found",
      data: users,
    });
  } catch (err) {
    console.error("Error in getAllUsers:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId });
    res.status(200).json({
      success: true,
      message: bookings.length > 0 ? "Appointments retrieved successfully" : "No appointments found",
      data: bookings,
    });
  } catch (err) {
    console.error("Error in getMyAppointments:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};