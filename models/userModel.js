import mongoose from "mongoose";

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
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    age: { type: Number, min: [0, "Age must be positive"] },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    address: { type: String, default: "India" },
    phone: { type: String, default: "+91 00000 00000" },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },
    image: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
