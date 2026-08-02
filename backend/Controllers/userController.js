import User from "../models/UserSchema.js";
import Booking from "../models/BookingSchema.js";
import Doctor from "../models/DoctorSchema.js";

export const updateUser = async (req, res) => {
  const id = req.params.id;
  try {
    const updateData = { ...req.body };
    if (updateData.password === "" || updateData.password === undefined) {
      delete updateData.password;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User successfully updated", data: updatedUser });
  } catch (err) {
    console.error("Update user error:", err.message, err.stack);
    res.status(500).json({ success: false, message: "Failed to update user", error: err.message });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  try {
    if (req.role !== "admin" && req.userId !== id) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User successfully deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

export const getSingleUser = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (req.userId === id) {
      return res.status(200).json({ success: true, message: "User found", data: user });
    }

    if (req.role === "doctor") {
      const booking = await Booking.findOne({
        $or: [{ user: id, doctor: req.userId }, { user: req.userId, doctor: id }],
      });
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
    let users;
    if (req.role === "admin") {
      users = await User.find({ role: "patient" }).select("-password");
    } else {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }
    res.status(200).json({
      success: true,
      message: users.length > 0 ? "Patients found" : "No patients found",
      data: users,
    });
  } catch (err) {
    console.error("Error in getAllUsers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, message: "User profile retrieved successfully", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    console.log("Fetching appointments for userId:", req.userId);
    const bookings = await Booking.find({ user: req.userId }).populate(
      "doctor",
      "name photo specialization averageRating totalRating experiences"
    );
    res.status(200).json({
      success: true,
      message: bookings.length > 0 ? "Appointments retrieved successfully" : "No appointments found",
      data: bookings,
    });
  } catch (err) {
    console.error("Error in getMyAppointments:", err.message);
    res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};