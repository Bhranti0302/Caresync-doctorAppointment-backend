import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import { createBaseController } from "./baseController.js";
import mongoose from "mongoose";

export const doctorController = createBaseController(Doctor);

// ✅ Add Doctor (Cloudinary Compatible)
export const addDoctor = async (req, res) => {
  try {
    // ✅ Only admin can add
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can add doctors" });
    }

    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const imagePath = req.file
      ? req.file.path
      : "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      image: imagePath,
    });

    res.status(201).json({
      message: "Doctor added successfully",
      doctor,
    });
  } catch (error) {
    console.error("❌ Error adding doctor:", error);
    res.status(500).json({
      message: "Server error",
      error: error?.message || JSON.stringify(error),
    });
  }
};

// ✅ Update Doctor (Cloudinary Compatible)
export const updateDoctorDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // 1️⃣ Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    // 2️⃣ Find doctor by ID
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // 3️⃣ Authorization check
    if (
      currentUser.role !== "admin" &&
      doctor._id.toString() !== currentUser._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this doctor" });
    }

    console.log("📸 Uploaded File (Update):", req.file);

    // 4️⃣ Prepare updates safely
    const updates = {
      name: req.body?.name || doctor.name,
      speciality: req.body?.speciality || doctor.speciality,
      degree: req.body?.degree || doctor.degree,
      experience: req.body?.experience || doctor.experience,
      about: req.body?.about || doctor.about,
      fees: req.body?.fees || doctor.fees,
      address: req.body?.address || doctor.address,
      image: req.file?.path || doctor.image, // Cloudinary URL if uploaded
    };

    // 5️⃣ Update doctor
    const updatedDoctor = await Doctor.findByIdAndUpdate(id, updates, {
      new: true,
    });

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("❌ Error updating doctor:", error);
    res.status(500).json({
      message: "Server error",
      error: error?.message || JSON.stringify(error),
    });
  }
};
