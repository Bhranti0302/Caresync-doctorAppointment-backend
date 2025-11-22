import mongoose from "mongoose";
import Appointment from "./appointmentModel.js";
import bcrypt from "bcryptjs";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    speciality: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true, trim: true },
    about: { type: String, default: "" },
    fees: { type: Number, default: 0 },
    address: {
      line1: { type: String, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/500x500.png?text=Doctor+Profile", // default image
    },
    phone: { type: String },
    role: {
      type: String,
      enum: ["doctor", "admin", "patient"],
      default: "doctor",
    },
    available: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
doctorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🗑 Delete appointments if doctor deleted
doctorSchema.pre("findOneAndDelete", async function (next) {
  const doctorId = this.getQuery()._id;
  await Appointment.deleteMany({ doctor: doctorId });
  next();
});

export default mongoose.model("Doctor", doctorSchema);
