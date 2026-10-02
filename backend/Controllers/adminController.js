import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";

const ADMIN_TOKEN_LIFETIME = process.env.ADMIN_JWT_EXPIRES_IN || "12h";

// Compared against when the email is unknown, so a wrong email and a wrong
// password take the same time.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const loginAdmin = async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const password = req.body?.password;

    if (!email || typeof password !== "string" || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const admin = await User.findOne({
      email: new RegExp(`^${escapeRegex(email)}$`, "i"),
      role: "admin",
    });

    let valid = false;
    if (admin) valid = await admin.matchPassword(password);
    else await bcrypt.compare(password, DUMMY_HASH);

    if (!valid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, process.env.JWT_SECRET_KEY, {
      expiresIn: ADMIN_TOKEN_LIFETIME,
      algorithm: "HS256",
    });

    const { password: _password, ...rest } = admin.toObject();
    res.status(200).json({ success: true, token, data: rest, role: "admin" });
  } catch (err) {
    console.error("Admin login error:", err.message);
    res.status(500).json({ success: false, message: "Login error" });
  }
};