// Telemedecine\backend\Controllers\bookingController.js
import Stripe from "stripe";
import sgMail from "@sendgrid/mail";
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import Booking from "../models/BookingSchema.js";

const TIME_ZONE = process.env.APP_TIMEZONE || "Africa/Tunis";

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

// Works whether the field is populated (an object) or a raw id, and when it is null.
const idOf = (ref) => (ref?._id ?? ref)?.toString();

const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/**
 * Creates the booking once a Stripe session is paid. It is called from the
 * success page (confirmCheckout) and from the webhook, so it must be safe to
 * run any number of times for the same session.
 */
const fulfillCheckoutSession = async (session) => {
  if (session.payment_status !== "paid") return { status: "unpaid" };

  const existing = await Booking.findOne({ stripeSessionId: session.id });
  if (existing) return { status: "exists", booking: existing };

  const { doctorId, userId, appointmentDate, ticketPrice } = session.metadata || {};
  const date = new Date(appointmentDate);
  if (!doctorId || !userId || Number.isNaN(date.getTime())) {
    throw new Error(`Session ${session.id} has incomplete metadata`);
  }

  // Someone else may have paid for the same slot while this patient was paying.
  const conflict = await Booking.findOne({
    doctor: doctorId,
    appointmentDate: date,
    status: { $ne: "cancelled" },
  });
  if (conflict) {
    if (session.payment_intent) {
      await getStripe().refunds.create(
        { payment_intent: session.payment_intent },
        { idempotencyKey: `slot-conflict-${session.id}` }
      );
    }
    return { status: "refunded" };
  }

  try {
    const booking = await Booking.create({
      doctor: doctorId,
      user: userId,
      ticketPrice,
      appointmentDate: date,
      isPaid: true,
      stripeSessionId: session.id,
      paymentIntentId: session.payment_intent || undefined,
    });
    return { status: "created", booking };
  } catch (err) {
    // The webhook and the success page raced; the other one won.
    if (err.code === 11000) {
      const booking = await Booking.findOne({ stripeSessionId: session.id });
      return { status: "exists", booking };
    }
    throw err;
  }
};

export const getCheckoutSession = async (req, res) => {
  try {
    const { appointmentDate } = req.body;

    const date = new Date(appointmentDate);
    if (!appointmentDate || Number.isNaN(date.getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "A valid appointment date is required" });
    }
    if (date.getTime() < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Please choose a time in the future" });
    }

    const [doctor, user] = await Promise.all([
      Doctor.findById(req.params.doctorId),
      User.findById(req.userId),
    ]);

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (doctor.isApproved && doctor.isApproved !== "approved") {
      return res
        .status(400)
        .json({ success: false, message: "This doctor is not available for booking" });
    }

    const amount = Math.round(Number(doctor.ticketPrice) * 100);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "This doctor has no valid consultation price" });
    }

    const slotTaken = await Booking.findOne({
      doctor: doctor._id,
      appointmentDate: date,
      status: { $ne: "cancelled" },
    });
    if (slotTaken) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked. Please choose another one.",
      });
    }

    // Stripe rejects an empty description or an invalid image URL.
    const productData = { name: "Consultation with doctor " + doctor.name };
    if (doctor.bio) productData.description = doctor.bio;
    if (doctor.photo && /^https?:\/\//.test(doctor.photo)) productData.images = [doctor.photo];

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.CLIENT_SITE_URL}/checkout-session?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_SITE_URL}/doctors/${doctor.id}`,
      customer_email: user.email,
      client_reference_id: req.params.doctorId,
      // The booking is created only after payment, from this metadata.
      metadata: {
        doctorId: String(doctor._id),
        userId: String(user._id),
        appointmentDate: date.toISOString(),
        ticketPrice: String(doctor.ticketPrice),
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: productData,
          },
          quantity: 1,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Redirecting to payment",
      session: { id: session.id, url: session.url },
    });
  } catch (err) {
    console.error("Checkout session error:", err.message);
    res.status(500).json({ success: false, message: "Error creating checkout session" });
  }
};

// Called by the success page right after Stripe redirects back.
export const confirmCheckout = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "string") {
      return res.status(400).json({ success: false, message: "Missing payment session" });
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.userId !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const result = await fulfillCheckoutSession(session);

    if (result.status === "unpaid") {
      return res.status(402).json({ success: false, message: "Payment was not completed" });
    }
    if (result.status === "refunded") {
      return res.status(409).json({
        success: false,
        message: "This time slot was just taken by someone else. Your payment has been refunded.",
      });
    }

    res.status(200).json({ success: true, message: "Appointment booked", data: result.booking });
  } catch (err) {
    console.error("Confirm checkout error:", err.message);
    res.status(500).json({ success: false, message: "Could not confirm your payment" });
  }
};

// Safety net: creates the booking even if the patient closed the tab before
// the success page loaded. Needs STRIPE_WEBHOOK_SECRET.
export const stripeWebhook = async (req, res) => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return res.status(503).send("Webhook is not configured");

  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, req.headers["stripe-signature"], secret);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    try {
      await fulfillCheckoutSession(event.data.object);
    } catch (err) {
      console.error("Webhook fulfillment failed:", err.message);
      return res.status(500).send("Fulfillment failed"); // Stripe will retry
    }
  }

  res.json({ received: true });
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
    console.error("Error fetching bookings:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("doctor", "name");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const userId = String(req.userId);
    if (userId !== idOf(booking.user) && userId !== idOf(booking.doctor)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    console.error("Error fetching booking:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const sendReminder = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email")
      .populate("doctor", "name email");
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (!booking.user || !booking.doctor) {
      return res
        .status(404)
        .json({ success: false, message: "User or Doctor not found in booking" });
    }

    const userId = String(req.userId);
    if (userId !== idOf(booking.user) && userId !== idOf(booking.doctor)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const when = new Date(booking.appointmentDate);
    const dateLabel = when.toLocaleDateString("en-US", {
      timeZone: TIME_ZONE,
      dateStyle: "long",
    });
    const timeLabel = when.toLocaleTimeString("en-US", {
      timeZone: TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const roomLink = `${process.env.CLIENT_SITE_URL}/consultation/${req.params.id}`;

    const msg = {
      to: [booking.user.email, booking.doctor.email].filter(Boolean),
      from: process.env.SENDGRID_FROM_EMAIL || "safwenbenmabrouk@gmail.com",
      subject: "Appointment Reminder",
      html: `<p>Your appointment with Dr. ${escapeHtml(booking.doctor.name)} is on ${dateLabel} at ${timeLabel}.</p>
             <p>Join the consultation here: <a href="${roomLink}">Click to Join</a></p>`,
    };

    await sgMail.sendMultiple(msg);
    res.status(200).json({ success: true, message: "Reminder sent successfully" });
  } catch (error) {
    console.error("Error sending reminder:", error.message);
    res.status(500).json({ success: false, message: "Failed to send reminder" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const userId = String(req.userId);
    const role = req.role;
    const allowed =
      role === "admin" ||
      (role === "patient" && userId === idOf(booking.user)) ||
      (role === "doctor" && userId === idOf(booking.doctor));

    if (!allowed) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      return res.status(400).json({ success: false, message: "Booking cannot be cancelled" });
    }

    // Refund first: if Stripe fails, the booking stays as it was.
    // Bookings created before this change have no payment id and are not refunded.
    let refunded = false;
    if (booking.isPaid && booking.paymentIntentId) {
      try {
        await getStripe().refunds.create(
          { payment_intent: booking.paymentIntentId },
          { idempotencyKey: `refund-${booking._id}` }
        );
        refunded = true;
      } catch (err) {
        if (err.code === "charge_already_refunded") {
          refunded = true;
        } else {
          console.error("Refund failed:", err.message);
          return res.status(502).json({
            success: false,
            message: "The refund could not be processed. Please try again.",
          });
        }
      }
    }

    booking.status = "cancelled";
    await booking.save();
    res.status(200).json({
      success: true,
      message: refunded ? "Booking cancelled and refunded" : "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error.message);
    res.status(500).json({ success: false, message: "Failed to cancel booking" });
  }
};

export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const userId = String(req.userId);
    if (userId !== idOf(booking.user) && userId !== idOf(booking.doctor)) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    if (!["pending", "approved"].includes(booking.status)) {
      return res.status(400).json({ success: false, message: "Booking cannot be completed" });
    }

    booking.status = "completed";
    await booking.save();
    res.status(200).json({ success: true, message: "Booking completed successfully" });
  } catch (error) {
    console.error("Error completing booking:", error.message);
    res.status(500).json({ success: false, message: "Failed to complete booking" });
  }
};