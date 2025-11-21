import mongoose from "mongoose";
import Appointment from "./appointmentModel.js";
import bcrypt from "bcryptjs";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    speciality: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },

    // Experience stored as a string — e.g. "3 Years"
    experience: {
      type: String,
      required: true,
      trim: true,
    },

    about: {
      type: String,
      default: "",
    },

    fees: {
      type: Number,
      default: 0,
    },

    // ⬇ address only line1 + line2
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
    },

    // ⬇ image stored as Cloudinary URL string only
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dggn2xhgk/image/upload/v1763117140/CareSync/doctors/profile_pic.png",
    },

    phone: String,

    role: {
      type: String,
      default: "doctor",
      enum: ["doctor", "admin", "patient"],
    },

    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🗑 Auto-delete appointments if doctor is removed
doctorSchema.pre("findOneAndDelete", async function (next) {
  const doctorId = this.getQuery()._id;
  await Appointment.deleteMany({ doctor: doctorId });
  next();
});

export default mongoose.model("Doctor", doctorSchema);
