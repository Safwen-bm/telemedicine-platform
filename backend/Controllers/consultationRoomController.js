// Telemedecine\backend\Controllers\consultationRoomController.js
import mongoose from "mongoose";
import ConsultationRoom from "../models/ConsultationRoomSchema.js";
import Booking from "../models/BookingSchema.js";

const ACTIVE = ["pending", "approved"];

// Works whether the field is populated (an object) or a raw id, and when it is null.
const idOf = (ref) => (ref?._id ?? ref)?.toString();

// Loads the booking and checks that this user is its doctor or its patient.
const loadBookingFor = async (bookingId, userId) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    return { error: { status: 404, message: "Booking not found" } };
  }
  const booking = await Booking.findById(bookingId);
  if (!booking) return { error: { status: 404, message: "Booking not found" } };

  const isDoctor = idOf(booking.doctor) === String(userId);
  const isPatient = idOf(booking.user) === String(userId);
  if (!isDoctor && !isPatient) {
    return { error: { status: 403, message: "Unauthorized access" } };
  }
  return { booking, isDoctor, isPatient };
};

const fail = (res, error) =>
  res.status(error.status).json({ success: false, message: error.message });

export const createOrJoinRoom = async (req, res) => {
  try {
    const bookingId = req.params.bookingId || req.body.bookingId;
    const { peerId } = req.body;

    if (typeof peerId !== "string" || !peerId) {
      return res.status(400).json({ success: false, message: "A peer id is required" });
    }

    const { booking, error } = await loadBookingFor(bookingId, req.userId);
    if (error) return fail(res, error);

    if (!ACTIVE.includes(booking.status)) {
      return res.status(409).json({
        success: false,
        message:
          booking.status === "cancelled"
            ? "This appointment was cancelled"
            : "This consultation has ended",
      });
    }

    // The upsert is atomic: two people joining at the same moment cannot
    // create two rooms.
    let room = await ConsultationRoom.findOneAndUpdate(
      { booking: booking._id },
      { $setOnInsert: { ended: false } },
      { new: true, upsert: true }
    );

    if (room.ended) {
      return res.status(409).json({ success: false, message: "This consultation has ended" });
    }

    // Replace this user's previous entry (a page refresh gives a new peer id).
    await ConsultationRoom.updateOne(
      { _id: room._id },
      { $pull: { participants: { userId: req.userId } } }
    );
    room = await ConsultationRoom.findOneAndUpdate(
      { _id: room._id },
      { $push: { participants: { userId: req.userId, peerId } } },
      { new: true }
    );

    res.status(200).json({ success: true, message: "Joined room", data: room });
  } catch (error) {
    console.error("Error creating/joining consultation room:", error.message);
    res.status(500).json({ success: false, message: "Failed to create/join room" });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { booking, error } = await loadBookingFor(bookingId, req.userId);
    if (error) return fail(res, error);

    const room = await ConsultationRoom.findOne({ booking: booking._id }).populate(
      "participants.userId",
      "name"
    );
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    res.status(200).json({ success: true, message: "Room found", data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const endRoom = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const { booking, isDoctor, error } = await loadBookingFor(bookingId, req.userId);
    if (error) return fail(res, error);

    // Only the doctor closes the consultation. A patient who hangs up is
    // just leaving, and can come back.
    if (!isDoctor) {
      return res.status(200).json({ success: true, message: "You left the consultation" });
    }

    await ConsultationRoom.findOneAndUpdate({ booking: booking._id }, { $set: { ended: true } });

    // Never resurrect a cancelled booking.
    await Booking.updateOne(
      { _id: booking._id, status: { $in: ACTIVE } },
      { $set: { status: "completed" } }
    );

    res.status(200).json({ success: true, message: "Consultation ended" });
  } catch (error) {
    console.error("Error ending room:", error.message);
    res.status(500).json({ success: false, message: "Failed to end room" });
  }
};