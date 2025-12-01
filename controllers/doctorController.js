import Doctor from "../models/doctorModel.js";
import Appointment from "../models/appointmentModel.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";

// ✅ ADD DOCTOR (ADMIN)
export const addDoctor = async (req, res) => {
  try {
    const {
      name,
      speciality,
      email,
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
      return res.status(400).json({ message: "Doctor already exists" });

    let image = {
      url: "https://via.placeholder.com/500x500.png?text=Doctor",
      public_id: null,
    };

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "CareSync/doctors",
      });

      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      speciality,
      email,
      password: hashedPassword,
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
  } catch (error) {
    console.error("Add doctor error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL DOCTORS (PUBLIC)
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET DOCTOR BY ID (PUBLIC)
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE DOCTOR BY ADMIN OR DOCTOR
export const updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (req.file) {
      if (doctor.image?.public_id) {
        await cloudinary.uploader.destroy(doctor.image.public_id);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "CareSync/doctors",
      });
      doctor.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    Object.assign(doctor, req.body);

    if (req.body.password) {
      doctor.password = await bcrypt.hash(req.body.password, 10);
    }

    await doctor.save();
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Update doctor error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE OWN PROFILE (DOCTOR)
export const updateDoctorByMe = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.user.userId);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    if (req.file) {
      if (doctor.image?.public_id) {
        await cloudinary.uploader.destroy(doctor.image.public_id);
      }
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "CareSync/doctors",
      });
      doctor.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    Object.assign(doctor, req.body);

    if (req.body.password) {
      doctor.password = await bcrypt.hash(req.body.password, 10);
    }

    await doctor.save();
    res.status(200).json(doctor);
  } catch (error) {
    console.error("Update own doctor profile error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE DOCTOR (ADMIN)
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Delete related appointments
    await Appointment.deleteMany({ doctor: req.params.id });

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
