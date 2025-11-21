import User from "../models/userModel.js";
import Appointment from "../models/appointmentModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// ------------------- GET LOGGED-IN USER PROFILE -------------------
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- UPDATE PROFILE (LOGGED-IN USER) -------------------
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let updateData = { ...req.body };

    // Image update
    if (req.file) {
      if (user.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }

      updateData.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    // Password update
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- DELETE LOGGED-IN USER -------------------
export const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    if (deletedUser?.image?.public_id) {
      await cloudinary.uploader.destroy(deletedUser.image.public_id);
    }

    await Appointment.deleteMany({ user: userId });

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- ADMIN: GET ALL USERS -------------------
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- ADMIN: GET USER BY ID -------------------
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
