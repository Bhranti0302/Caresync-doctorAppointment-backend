import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import { generateToken } from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendEmail.js";

// 🧾 USER SIGNUP
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, address, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      address,
      phone,
      role: "patient",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔐 LOGIN for User / Doctor / Admin
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🧑‍💼 Admin Login
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET);
      return res.status(200).json({
        message: "Admin login successful",
        role: "admin",
        token,
      });
    }

    // 👨‍⚕️ Doctor Login
    const doctor = await Doctor.findOne({ email });
    if (doctor) {
      const match = await bcrypt.compare(password, doctor.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      return res.status(200).json({
        message: "Doctor login successful",
        role: "doctor",
        user: doctor,
        token: generateToken(doctor._id),
      });
    }

    // 👤 User Login
    const user = await User.findOne({ email });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      return res.status(200).json({
        message: "User login successful",
        role: "patient",
        user,
        token: generateToken(user._id),
      });
    }

    res.status(404).json({ message: "Account not found" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 📧 FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes expiry
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;
    const message = `
      <h2>Reset Your Password</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link will expire in 15 minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: message,
    });

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Email could not be sent", error: error.message });
  }
};

// 🔄 RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const { password } = req.body;
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
