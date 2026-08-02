import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
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
import { PeerServer } from "peer";
import sgMail from "@sendgrid/mail";

dotenv.config();
console.log("Loaded Environment Variables:", {
  PORT: process.env.PORT,
  MONGO_URL: process.env.MONGO_URL,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  CLIENT_SITE_URL: process.env.CLIENT_SITE_URL,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
});

if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY.startsWith("SG.")) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log("SendGrid API key set successfully");
} else {
  console.warn("SendGrid API Key is invalid or missing. Email functionality will be disabled.");
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
});
const peerServer = PeerServer({ port: 5001, path: "/peerjs", debug: true });
const port = process.env.PORT || 5000;

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.get("/", (req, res) => {
  res.send("Api is working");
});

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB database is connected");
  } catch (err) {
    console.log("MongoDB database connection failed");
  }
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
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

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join-consultation", ({ bookingId, userId }) => {
    socket.join(bookingId);
    console.log(`User ${userId} joined consultation ${bookingId}`);
    socket.to(bookingId).emit("user-joined", { userId, socketId: socket.id });
  });

  socket.on("signal", ({ bookingId, userId, signal }) => {
    console.log(`Signal from user ${userId} in consultation ${bookingId}`);
    socket.to(bookingId).emit("signal", { userId, signal });
  });

  socket.on("disconnect", (reason) => {
    console.log("Client disconnected:", socket.id, "Reason:", reason);
  });

  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
});

server.listen(port, () => {
  connectDB();
  console.log("Server is running on port " + port);
  console.log("PeerJS server running on port 5001");
});

export { sgMail };