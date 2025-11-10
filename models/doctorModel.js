import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
    },
    speciality: {
      type: String,
      required: [true, "Speciality is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    degree: {
      type: String,
      required: [true, "Degree is required"],
    },
    experience: {
      type: String,
      required: [true, "Experience is required"],
    },
    about: {
      type: String,
      maxlength: [2000, "About section too long"], // ✅ increased limit
      default: "",
    },
    fees: {
      type: Number,
      required: [true, "Fees is required"],
      min: [0, "Fees must be positive"],
    },
    address: {
      line1: { type: String, required: true },
      line2: { type: String },
    },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/3774/3774299.png",
    },
    role: {
      type: String,
      enum: ["doctor"],
      default: "doctor",
    },
    available: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
