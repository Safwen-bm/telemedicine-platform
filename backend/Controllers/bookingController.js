import Stripe from "stripe";
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";
import { sgMail } from "../index.js";

export const getCheckoutSession = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.doctorId);
    const user = await User.findById(req.userId);
    const { appointmentDate } = req.body;

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-session`,
      cancel_url: `${req.protocol}://${req.get("host")}/doctors/${doctor.id}`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: doctor.ticketPrice * 100,
            product_data: {
              name: "Consultation with doctor " + doctor.name,
              description: doctor.bio,
              images: [doctor.photo],
            },
          },
          quantity: 1,
        },
      ],
    });

    const booking = new Booking({
      doctor: doctor._id,
      user: user._id,
      ticketPrice: doctor.ticketPrice,
      appointmentDate: new Date(appointmentDate),
      session: session.id,
    });

    await booking.save();

    res.status(200).json({ success: true, message: "Successfully paid", session });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error creating checkout session" });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const userId = req.userId;
    const role = req.role;

    let query = {};
    if (role === "doctor") {
      query.doctor = userId;
    } else if (role === "patient") {
      query.user = userId;
    } else if (role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const bookings = await Booking.find(query)
      .populate("user", "name")
      .populate("doctor", "name specialization");

    res.status(200).json({
      success: true,
      message: bookings.length > 0 ? "Bookings found" : "No bookings found",
      data: bookings,
    });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendReminder = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user")
      .populate("doctor");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (!booking.user || !booking.doctor) {
      return res.status(404).json({ success: false, message: "User or Doctor not found in booking" });
    }

    const userId = req.userId;
    if (
      userId !== booking.user._id.toString() &&
      userId !== booking.doctor._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const appointmentTime = booking.appointmentDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const roomLink = `${process.env.CLIENT_SITE_URL}/consultation/${req.params.id}`;
    const msg = {
      to: [booking.user.email, booking.doctor.email],
      from: "safwenbenmabrouk@gmail.com",
      subject: "Appointment Reminder",
      html: `<p>Your appointment with Dr. ${booking.doctor.name} is on ${new Date(
        booking.appointmentDate
      ).toLocaleDateString()} at ${appointmentTime}.</p>
             <p>Join the consultation here: <a href="${roomLink}">Click to Join</a></p>`,
    };

    const sendGridResponse = await sgMail.send(msg);
    console.log("SendGrid notification response:", sendGridResponse);
    res.status(200).json({ success: true, message: "Reminder sent successfully" });
  } catch (error) {
    console.error("Error sending reminder:", error);
    res.status(500).json({ success: false, message: "Failed to send reminder", error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const userId = req.userId;
    const role = req.role;
    if (
      (role !== "admin" && userId !== booking.user._id.toString() && userId !== booking.doctor._id.toString()) ||
      (role === "patient" && userId !== booking.user._id.toString())
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Booking cannot be cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();
    res.status(200).json({ success: true, message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ success: false, message: "Failed to cancel booking", error: error.message });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const userId = req.userId;
    if (
      userId !== booking.user._id.toString() &&
      userId !== booking.doctor._id.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking cannot be completed" });
    }
    booking.status = "completed";
    await booking.save();
    res.status(200).json({ success: true, message: "Booking completed successfully" });
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ success: false, message: "Failed to complete booking", error: error.message });
  }
};