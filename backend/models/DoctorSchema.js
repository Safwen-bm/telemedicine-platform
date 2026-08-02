import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    bio: {
      type: String,
      maxLength: 100,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
    },
    specialization: {
      type: String,
      enum: [
        "surgery",
        "cardiology",
        "dermatology",
        "endocrinology",
        "gastroenterology",
        "neurology",
        "oncology",
        "orthopedics",
        "pediatrics",
        "psychiatry",
        "radiology",
      ],
    },
    ticketPrice: {
      type: Number,
    },
    qualifications: [
      {
        startingDate: { type: Date },
        endingDate: { type: Date },
        degree: { type: String },
        university: { type: String },
      },
    ],
    experiences: [
      {
        startingDate: { type: Date },
        endingDate: { type: Date },
        position: { type: String },
        hospital: { type: String },
      },
    ],
    about: {
      type: String,
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      default: "doctor",
    },
    isApproved: {
      type: String,
      enum: ["pending", "approved", "cancelled"],
      default: "pending",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    reviews: [{ type: mongoose.Types.ObjectId, ref: "Review" }],
    appointments: [{ type: mongoose.Types.ObjectId, ref: "Booking" }],
  },
  { timestamps: true }
);

doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

doctorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Doctor", doctorSchema);