import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";

const TOKEN_LIFETIME = process.env.JWT_EXPIRES_IN || "7d";

// Admins are never created through the public API. Use scripts/createAdmin.js.
const REGISTERABLE_ROLES = ["patient", "doctor"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

// Compared against when the email is unknown, so a wrong email and a wrong
// password take the same time and cannot be told apart.
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", 10);

const bad = (res, status, message) => res.status(status).json({ success: false, message });

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Case-insensitive, so accounts created with a mixed-case email still match.
const findByEmail = (Model, email) =>
  Model.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, "i") });

const findAccountByEmail = async (email) =>
  (await findByEmail(User, email)) || (await findByEmail(Doctor, email));

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: TOKEN_LIFETIME,
    algorithm: "HS256",
  });

export const register = async (req, res) => {
  const { name, password, gender, dateOfBirth, photo, role } = req.body || {};
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";

  try {
    if (!REGISTERABLE_ROLES.includes(role)) {
      return bad(res, 400, "Please choose a valid account type");
    }
    if (typeof name !== "string" || !name.trim()) return bad(res, 400, "Name is required");
    if (!EMAIL_RE.test(email)) return bad(res, 400, "Please enter a valid email address");
    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return bad(res, 400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }

    // One email, one account, across patients and doctors.
    if (await findAccountByEmail(email)) return bad(res, 400, "User already exists");

    const Model = role === "doctor" ? Doctor : User;
    const user = new Model({
      name: name.trim(),
      email,
      password, // hashed by the schema's pre-save hook
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
      photo: photo || undefined,
      role,
    });

    await user.save();

    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (err) {
    if (err.name === "ValidationError") {
      const first = Object.values(err.errors)[0];
      return bad(res, 400, first?.message || "Invalid data");
    }
    if (err.code === 11000) return bad(res, 400, "User already exists");
    console.error("Registration error:", err.message);
    res
      .status(500)
      .json({ success: false, message: "User not created, internal server error. Try again." });
  }
};

export const login = async (req, res) => {
  const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const password = req.body?.password;

  try {
    if (!email || typeof password !== "string" || !password) {
      return bad(res, 400, "Email and password are required");
    }

    const user = await findAccountByEmail(email);

    let valid = false;
    if (user) valid = await user.matchPassword(password);
    else await bcrypt.compare(password, DUMMY_HASH);

    if (!valid) return bad(res, 401, "Invalid email or password");

    const token = generateToken(user);
    const { password: _password, ...rest } = user.toObject();

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      data: rest,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Failed to login" });
  }
};