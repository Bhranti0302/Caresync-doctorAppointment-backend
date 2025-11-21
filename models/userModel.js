import mongoose from "mongoose";
import Appointment from "./appointmentModel.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters long"],
    },
    phone: String,
    address: Object,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    age: {
      type: Number,
      min: [0, "Age cannot be negative"],
    },
    role: {
      type: String,
      enum: ["patient", "admin"],
      default: "patient",
    },
    image: {
      url: String,
      public_id: String,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// 🗑️ Auto-delete appointments if user is removed
userSchema.pre("findOneAndDelete", async function (next) {
  const userId = this.getQuery()._id;
  await Appointment.deleteMany({ user: userId });
  console.log("🗑️ Deleted appointments linked to user:", userId);
  next();
});

export default mongoose.model("User", userSchema);
