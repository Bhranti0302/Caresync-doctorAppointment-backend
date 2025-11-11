import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import { createBaseController } from "./baseController.js";

export const doctorController = createBaseController(Doctor);

// ✅ Add Doctor (Cloudinary Compatible)
export const addDoctor = async (req, res) => {
  try {
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

    // ✅ Check uploaded file
    console.log("📸 Uploaded File:", req.file);

    // ✅ Get Cloudinary URL (if uploaded)
    const imagePath = req.file
      ? req.file.path // this is the Cloudinary URL
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

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (
      currentUser.role !== "admin" &&
      doctor._id.toString() !== currentUser._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this doctor" });
    }

    console.log("📸 Uploaded File (Update):", req.file);

    const updates = {
      name: req.body.name || doctor.name,
      speciality: req.body.speciality || doctor.speciality,
      degree: req.body.degree || doctor.degree,
      experience: req.body.experience || doctor.experience,
      about: req.body.about || doctor.about,
      fees: req.body.fees || doctor.fees,
      address: req.body.address || doctor.address,
      image: req.file ? req.file.path : doctor.image, // ✅ Cloudinary URL
    };

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
