import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import { createBaseController } from "./baseController.js";

// ✅ Inherit base controller (for CRUD)
export const userController = createBaseController(User);

// ✅ Override `getAll` with role-based access
userController.getAll = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let users;

    if (req.user.role === "admin") {
      // ✅ Admin: can view all users
      users = await User.find().select("-password");
    } else if (req.user.role === "doctor") {
      // ✅ Doctor: can view only patients
      users = await User.find({ role: "patient" }).select("-password");
    } else {
      // ❌ Patients or others: not allowed
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error in getAll:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update Profile (Cloudinary-Compatible)
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;

    if (req.file && req.file.path) {
      user.image = req.file.path;
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error updating profile:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
