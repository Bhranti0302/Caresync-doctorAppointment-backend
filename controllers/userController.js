import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";

/* ================================
   ✅ GET ALL USERS (ADMIN)
================================ */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ✅ GET USER BY ID (ADMIN)
================================ */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ✅ GET USER PROFILE (SELF)
================================ */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ✅ UPDATE USER PROFILE
================================ */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.file) {
      if (user.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "CareSync/users",
      });

      user.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    Object.assign(user, req.body);

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Update user error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ✅ DELETE USER (ADMIN)
================================ */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    await Appointment.deleteMany({ user: req.params.id });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================================
   ✅ DELETE MY ACCOUNT (SELF)
================================ */
export const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.userId; // from your JWT

    const user =
      (await User.findByIdAndDelete(userId)) ||
      (await Doctor.findByIdAndDelete(userId));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Appointment.deleteMany({
      $or: [{ user: userId }, { doctor: userId }],
    });

    // Clear token cookie
    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
