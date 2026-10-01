import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/UserSchema.js";

// This is how admins are created Run it from the backend folder :$env:ADMIN_EMAIL="you@example.com"; $env:ADMIN_PASSWORD="a-strong-password"; node scripts/createAdmin.js

const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Administrator" } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD first (see the command below).");
  process.exit(1);
}
if (ADMIN_PASSWORD.length < 8) {
  console.error("ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URL);

const email = ADMIN_EMAIL.trim().toLowerCase();
const existing = await User.findOne({ email });

if (existing) {
  console.log(
    existing.role === "admin"
      ? "An admin with this email already exists."
      : "This email belongs to a non-admin account. Use another email."
  );
} else {
  await User.create({ name: ADMIN_NAME, email, password: ADMIN_PASSWORD, role: "admin" });
  console.log("Admin created:", email);
}

await mongoose.disconnect();
