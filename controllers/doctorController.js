// controllers/doctorController.js

import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";

// GET ALL DOCTORS (PUBLIC)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select("-password");
    res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET DOCTOR BY ID (PUBLIC)
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ADD DOCTOR (ADMIN ONLY)
export const addDoctor = async (req, res) => {
  try {
    const { name, email, password, speciality, degree, experience, about, fees, phone, address } = req.body;

    const exists = await Doctor.findOne({ email });
    if (exists) return res.status(400).json({ message: "Doctor already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let image = {
      url: req.file
        ? (await cloudinary.uploader.upload(req.file.path, { folder: "CareSync/doctors" })).secure_url
        : "https://via.placeholder.com/500x500.png?text=Doctor+Profile",
      public_id: req.file ? "uploaded" : null,
    };

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      phone,
      address,
      image,
      role: "doctor",
    });

    res.status(201).json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE DOCTOR (ADMIN OR SELF)
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Update image if provided
    if (req.file) {
      if (doctor.image?.public_id) await cloudinary.uploader.destroy(doctor.image.public_id);
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "CareSync/doctors" });
      doctor.image = { url: result.secure_url, public_id: result.public_id };
    }

    // Update allowed fields
    const fields = ["name","speciality","email","degree","experience","about","fees","phone","address","available"];
    fields.forEach(f => { if (req.body[f] !== undefined) doctor[f] = req.body[f]; });

    if (req.body.password) doctor.password = await bcrypt.hash(req.body.password, 10);

    await doctor.save();
    res.status(200).json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE OWN PROFILE (DOCTOR)
export const updateDoctorByMe = async (req, res) => {
  req.params.id = req.user.userId;
  return updateDoctor(req, res);
};

// DELETE DOCTOR (ADMIN)
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    await Appointment.deleteMany({ doctor: req.params.id });

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
