import User from "../models/UserSchema.js";
import Doctor from "../models/DoctorSchema.js";
import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "360d",
  });
};

export const register = async (req, res) => {
  const { name, email, password, gender, country, dateOfBirth, photo, role } = req.body;

  try {
    let user = null;

    if (role === "patient" || role === "admin") {
      user = await User.findOne({ email });
    } else if (role === "doctor") {
      user = await Doctor.findOne({ email });
    }

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "patient" || role === "admin") {
      user = new User({
        name,
        email,
        password, // Will be hashed by schema pre-save hook
        gender,
        country,
        dateOfBirth,
        photo,
        role,
      });
    } else if (role === "doctor") {
      user = new Doctor({
        name,
        email,
        password, // Will be hashed by schema pre-save hook
        gender,
        country,
        dateOfBirth,
        photo,
        role,
      });
    }

    await user.save();

    res.status(201).json({ success: true, message: "User created successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ status: false, message: "User Not Created, Internal server error, Try again" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await Doctor.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ status: false, message: "Invalid password" });
    }

    const token = generateToken(user);

    const { password: _, ...rest } = user._doc; // Exclude password and all other fields dynamically

    res.status(200).json({ success: true, message: "User logged in successfully", token, data: rest, role: user.role });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ status: false, message: "Failed to login" });
  }
};