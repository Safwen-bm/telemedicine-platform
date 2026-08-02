import ConsultationRoom from "../models/ConsultationRoomSchema.js";
import Booking from "../models/BookingSchema.js";

export const createOrJoinRoom = async (req, res) => {
  try {
    const { bookingId, peerId } = req.body;
    const userId = req.userId; // From auth middleware
    console.log("Incoming request to join room:", { bookingId, peerId, userId, role: req.role });

    // Validate booking exists and user is part of it
    const booking = await Booking.findById(bookingId).populate("doctor user");
    if (!booking) {
      console.log("Booking not found for ID:", bookingId);
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    console.log("Booking details:", {
      bookingId: booking._id,
      doctor: booking.doctor,
      user: booking.user,
      requestedUserId: userId,
    });

    // Compare userId with booking.doctor._id and booking.user._id as strings
    const isDoctor = booking.doctor._id.toString() === userId;
    const isPatient = booking.user._id.toString() === userId;
    if (!isDoctor && !isPatient) {
      console.log("Unauthorized access - User not part of this booking:", { userId, booking });
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // Check if room already exists for this booking
    let room = await ConsultationRoom.findOne({ booking: bookingId });
    if (room) {
      // Add participant if not already present
      if (!room.participants.some((p) => p.userId.toString() === userId)) {
        room.participants.push({ userId, peerId });
        await room.save();
      }
      return res.status(200).json({ success: true, message: "Joined existing room", data: room });
    }

    // Create new room if it doesn't exist
    room = new ConsultationRoom({
      booking: bookingId,
      participants: [{ userId, peerId }],
    });
    await room.save();

    res.status(201).json({ success: true, message: "Room created and joined", data: room });
  } catch (error) {
    console.error("Error creating/joining consultation room:", error);
    res.status(500).json({ success: false, message: "Failed to create/join room", error: error.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.userId;
    const booking = await Booking.findById(bookingId).populate("doctor user");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    const isDoctor = booking.doctor._id.toString() === userId;
    const isPatient = booking.user._id.toString() === userId;
    if (!isDoctor && !isPatient) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const room = await ConsultationRoom.findOne({ booking: bookingId }).populate("participants.userId", "name");
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
    const userId = req.userId;
    const booking = await Booking.findById(bookingId).populate("doctor user");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    const isDoctor = booking.doctor._id.toString() === userId;
    const isPatient = booking.user._id.toString() === userId;
    if (!isDoctor && !isPatient) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const room = await ConsultationRoom.findOneAndUpdate(
      { booking: bookingId },
      { $set: { ended: true } },
      { new: true }
    );
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }
    await Booking.findByIdAndUpdate(bookingId, { status: "completed" });
    res.status(200).json({ success: true, message: "Room ended successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to end room" });
  }
};