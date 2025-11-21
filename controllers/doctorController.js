import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// ------------------- GET ALL DOCTORS -------------------
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- GET DOCTOR BY ID -------------------
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- ADD DOCTOR (ADMIN) -------------------
export const addDoctor = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body missing" });
    }

    const exists = await Doctor.findOne({ email: req.body.email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const doctor = await Doctor.create({
      name: req.body.name,
      speciality: req.body.speciality,
      email: req.body.email,
      password: hashedPassword,
      degree: req.body.degree,
      experience: req.body.experience,
      about: req.body.about,
      fees: req.body.fees,
      phone: req.body.phone,

      // Address must be stored as object
      address: {
        line1: req.body.address?.line1,
        line2: req.body.address?.line2,
        city: req.body.address?.city,
        state: req.body.address?.state,
        pincode: req.body.address?.pincode,
      },

      // Image must be stored as single string
      image: req.file
        ? req.file.path // Cloudinary uploaded file path
        : req.body.image, // If adding image via URL

      role: "doctor",
      available: true,
    });

    res.status(201).json({ message: "Doctor created", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- UPDATE DOCTOR (ADMIN + DOCTOR) -------------------
export const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    let updateData = { ...req.body };

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // ⚠ Doctor can update only own profile
    if (
      req.user.role === "doctor" &&
      doctor._id.toString() !== req.user.doctorId
    ) {
      return res
        .status(403)
        .json({ message: "You can update only your own profile" });
    }

    // 🖼 Image handling
    if (req.file) {
      if (doctor.image?.public_id) {
        await cloudinary.uploader.destroy(doctor.image.public_id);
      }
      updateData.image = { url: req.file.path, public_id: req.file.filename };
    }

    // 🔐 Password update
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- DELETE DOCTOR + APPOINTMENTS (ADMIN) -------------------
export const deleteDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;

    const deletedDoctor = await Doctor.findByIdAndDelete(doctorId);
    if (!deletedDoctor)
      return res.status(404).json({ message: "Doctor not found" });

    if (deletedDoctor?.image?.public_id) {
      await cloudinary.uploader.destroy(deletedDoctor.image.public_id);
    }

    await Appointment.deleteMany({ doctor: doctorId });

    res
      .status(200)
      .json({ message: "Doctor and related appointments removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------- UPDATE OWN PROFILE (/me/update) - DOCTOR ONLY -------------------
export const updateDoctorByMe = async (req, res) => {
  try {
    const doctorId = req.user.doctorId; // must NOT be undefined
    let updateData = { ...req.body };

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (req.body.address) {
      updateData.address = { ...doctor.address, ...req.body.address };
    }

    if (req.file) {
      if (doctor.image?.public_id) {
        await cloudinary.uploader.destroy(doctor.image.public_id);
      }
      updateData.image = { url: req.file.path, public_id: req.file.filename };
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ message: "Profile updated", doctor: updatedDoctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
