import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import { createBaseController } from "./baseController.js";

export const doctorController = createBaseController(Doctor);

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

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required",
      });
    }

    // Check for existing doctor
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Image handling
    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

    // Create new doctor
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
    console.error("Error adding doctor:", error);
    res.status(500).json({ message: error.message });
  }
};
