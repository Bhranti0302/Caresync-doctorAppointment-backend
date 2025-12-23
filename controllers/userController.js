import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";

// =============================
// GET ALL USERS (ADMIN)
// =============================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// GET USER BY ID (ADMIN)
// =============================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// GET USER PROFILE (SELF)
// =============================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// UPDATE USER PROFILE (SELF)
// =============================
// =============================
// UPDATE USER PROFILE (SELF)
// =============================
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });


    // ------- UPDATE TEXT FIELDS -------
    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    user.age = req.body.age ?? user.age;
    user.gender = req.body.gender ?? user.gender;
    user.phone = req.body.phone ?? user.phone;

    // Handle address safely
    if (req.body.address) {
      try {
        user.address = JSON.parse(req.body.address);
      } catch {
        user.address = req.body.address;
      }
    }

    // ------- IMAGE UPLOAD -------
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (user.image?.public_id) {
        try {
          await cloudinary.uploader.destroy(user.image.public_id);
        } catch (err) {
          console.warn("Old image deletion failed:", err.message);
        }
      }

      // Assign new image object
      user.image = {
        url: req.file.secure_url || req.file.path || req.file.url,
        public_id: req.file.public_id || req.file.filename,
      };
    }
    // If no new file, keep existing user.image intact

    const updatedUser = await user.save();

    // Return full image object instead of only URL
    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      age: updatedUser.age,
      address: updatedUser.address,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      image: updatedUser.image, // full object preserved
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
};


// =============================
// DELETE USER (ADMIN)
// =============================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await Appointment.deleteMany({ user: req.params.id });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// =============================
// DELETE OWN ACCOUNT (SELF)
// =============================
export const deleteMyAccount = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user =
      (await User.findByIdAndDelete(userId)) ||
      (await Doctor.findByIdAndDelete(userId));

    if (!user) return res.status(404).json({ message: "User not found" });

    await Appointment.deleteMany({
      $or: [{ user: userId }, { doctor: userId }],
    });

    res.clearCookie("token", {
      path: "/",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
