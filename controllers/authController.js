import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";

dotenv.config();

// 🔑 Generate JWT token (no expiry)
const generateToken = (id, role = "user") => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { noTimestamp: true });
};

// ✅ REGISTER USER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser =
      (await User.findOne({ email })) || (await Doctor.findOne({ email }));

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser =
      role === "doctor"
        ? await Doctor.create({ name, email, password: hashedPassword })
        : await User.create({ name, email, password: hashedPassword });

    const token = generateToken(newUser._id, role);

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role,
      },
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user =
      (await User.findOne({ email })) || (await Doctor.findOne({ email }));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // detect admin
    const role =
      email === (process.env.ADMIN_EMAIL || "admin@0320.com")
        ? "admin"
        : user.role || "user";

    const token = generateToken(user._id, role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 💤 DUMMY Forgot Password (to prevent crash)
export const forgotPassword = async (req, res) => {
  res.status(200).json({
    message: "Forgot password endpoint is not implemented yet",
  });
};

// 💤 DUMMY Reset Password (to prevent crash)
export const resetPassword = async (req, res) => {
  res.status(200).json({
    message: "Reset password endpoint is not implemented yet",
  });
};
