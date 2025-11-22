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
    const {
      name,
      email,
      speciality,
      password,
      degree,
      experience,
      about,
      fees,
      phone,
      address,
    } = req.body;

    const exists = await Doctor.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl =
      req.body.image ||
      "https://via.placeholder.com/500x500.png?text=Doctor+Profile";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "CareSync/doctors",
      });
      imageUrl = result.secure_url;
    }

    const doctor = await Doctor.create({
      name,
      email,
      speciality,
      password: hashedPassword,
      degree,
      experience,
      about,
      fees,
      phone,
      address,
      image: imageUrl,
      role: "doctor",
      available: true,
    });

    res.status(201).json({ message: "Doctor created", doctor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------- UPDATE DOCTOR ----------------
export const updateDoctor = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    let updateData = { ...req.body };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "CareSync/doctors",
      });
      updateData.image = result.secure_url;
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Doctor updated", doctor: updatedDoctor });
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
