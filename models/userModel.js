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
      url: {
        type: String,
        default: "https://via.placeholder.com/500x500.png?text=User+Profile",
      },
      public_id: { type: String, default: null },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// 🗑 Safe delete user appointments
userSchema.pre("findOneAndDelete", async function (next) {
  try {
    const userId = this.getQuery()._id;
    if (userId) {
      await Appointment.deleteMany({ user: userId });
      
    }
    next();
  } catch (error) {
    console.error("Error deleting user's appointments:", error.message);
    next(error);
  }
});

export default mongoose.model("User", userSchema);
