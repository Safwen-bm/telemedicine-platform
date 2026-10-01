import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import authRoute from "./Routes/auth.js";
import userRoute from "./Routes/user.js";
import doctorRoute from "./Routes/doctor.js";
import reviewRoute from "./Routes/review.js";
import bookingRoute from "./Routes/booking.js";
import consultationRoomRoute from "./Routes/consultationRoom.js";
import medicalNoteRoute from "./Routes/medicalNote.js";
import medicalFolderRoute from "./Routes/medicalFolder.js";
import adminRouter from "./Routes/adminRoute.js";
import analyticsRouter from "./Routes/analytics.js";
import { Server } from "socket.io";
import http from "http";
import { ExpressPeerServer } from "peer";
import sgMail from "@sendgrid/mail";
import { stripeWebhook } from "./Controllers/bookingController.js";

const isProd = process.env.NODE_ENV === "production";
const debug = (...args) => {
  if (!isProd) console.log(...args);
};

// Never print secret values, only which variables are missing.
const required = ["MONGO_URL", "JWT_SECRET_KEY", "STRIPE_SECRET_KEY", "CLIENT_SITE_URL"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error("Missing environment variables:", missing.join(", "));
  if (isProd) process.exit(1);
}

if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith("SG.")) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SendGrid API key is invalid or missing. Email functionality will be disabled.");
}

const allowedOrigins = [process.env.CLIENT_SITE_URL, !isProd && "http://localhost:5173"]
  .filter(Boolean)
  .map((origin) => origin.replace(/\/$/, ""));

const app = express();
app.disable("x-powered-by");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"], // top-level option, it was wrongly nested inside cors
});

app.use(
  "/peerjs",
  ExpressPeerServer(server, { debug: !isProd, corsOptions: { origin: allowedOrigins } })
);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Api is working");
});

mongoose.set("strictQuery", false);

app.post("/api/v1/bookings/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/doctors", doctorRoute);
app.use("/api/v1/reviews", reviewRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/consultation-rooms", consultationRoomRoute);
app.use("/api/v1/medical-notes", medicalNoteRoute);
app.use("/api/v1/medical-folder", medicalFolderRoute);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/analytics", analyticsRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res
    .status(err.status || 500)
    .json({ success: false, message: isProd ? "Server error" : err.message });
});

io.on("connection", (socket) => {
  debug("New client connected:", socket.id);

  socket.on("join-consultation", ({ bookingId, userId, peerId }) => {
    socket.join(bookingId);
    debug(`User ${userId} joined consultation ${bookingId}`);
    socket.to(bookingId).emit("user-joined", { userId, peerId, socketId: socket.id });
  });

  socket.on("disconnect", (reason) => {
    debug("Client disconnected:", socket.id, "Reason:", reason);
  });

  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB database is connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // fail fast instead of running a server with no database
  }

  server.listen(port, () => {
    console.log("Server is running on port " + port);
  });
};

start();

export { sgMail };