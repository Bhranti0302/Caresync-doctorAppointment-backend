import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

// Generate Token & Send Cookie
const sendTokenResponse = (res, user) => {
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      doctorId: user.role === "doctor" ? user._id : undefined,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });
};

// -------------------- REGISTER --------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name)
      return res.status(400).json({ message: "All fields are required" });

    if (role === "doctor") {
      const exists = await Doctor.findOne({ email });
      if (exists)
        return res.status(400).json({ message: "Email already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const doctor = await Doctor.create({
        name,
        email,
        password: hashedPassword,
        role: "doctor",
      });

      sendTokenResponse(res, doctor);
      return res.status(201).json({
        message: "Doctor registered",
        user: {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          role: doctor.role,
          doctorId: doctor._id,
        },
      });
    }

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient",
    });

    sendTokenResponse(res, user);
    return res.status(201).json({
      message: "User registered",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- LOGIN --------------------
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    let user =
      (await User.findOne({ email }).select("+password")) ||
      (await Doctor.findOne({ email }).select("+password"));

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    sendTokenResponse(res, user);
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        doctorId: user.role === "doctor" ? user._id : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- FORGOT PASSWORD --------------------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let user =
      (await User.findOne({ email })) || (await Doctor.findOne({ email }));

    if (!user) return res.status(404).json({ message: "Email not registered" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();

    res.status(200).json({
      message: "Password reset token generated",
      token: resetToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- RESET PASSWORD --------------------
export const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const { password } = req.body;

    let user =
      (await User.findOne({ resetPasswordToken: token })) ||
      (await Doctor.findOne({ resetPasswordToken: token }));

    if (!user) return res.status(400).json({ message: "Invalid token" });
    if (user.resetPasswordExpire < Date.now())
      return res.status(400).json({ message: "Token expired" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -------------------- LOGOUT --------------------
export const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
