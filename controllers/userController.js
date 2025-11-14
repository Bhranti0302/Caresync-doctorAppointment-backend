import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { createBaseController } from "./baseController.js";

// ✅ Base controller for generic CRUD
export const userController = createBaseController(User);

// ✅ Add new user
export const addUser = async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imagePath = req.file
      ? req.file.path
      : "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      role: role || "patient",
      image: imagePath,
    });

    res.status(201).json({
      message: "User added successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error adding user:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update user details (secure + consistent)
export const updateUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      currentUser.role !== "admin" &&
      user._id.toString() !== currentUser.id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updates = { ...req.body };

    // -------------------------------
    // 🔹 Upload image to Cloudinary
    // -------------------------------
    if (req.file) {
      const cloudUpload = await cloudinary.uploader.upload(req.file.path, {
        folder: "caresync_users",
      });
      updates.image = cloudUpload.secure_url;
    }

    // 🔹 Address parse
    if (req.body["address[line1]"] || req.body["address[line2]"]) {
      updates.address = {
        line1: req.body["address[line1]"] || "",
        line2: req.body["address[line2]"] || "",
      };
    }

    delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: error.message });
  }
};
