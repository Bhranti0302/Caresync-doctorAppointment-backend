// controllers/bookingController.js

import Appointment from "../models/appointmentModel.js";

// ✅ CREATE APPOINTMENT
export const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason, fees } = req.body;

    if (!doctor || !date || !time || !fees) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const appointment = await Appointment.create({
      doctor,
      user: req.user._id,
      date,
      time,
      reason,
      fees,
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Create appointment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET APPOINTMENTS FOR LOGGED-IN USER OR DOCTOR
export const getAppointmentsByMe = async (req, res) => {
  try {
    const userId = req.user._id;

    let appointments;
    if (req.user.role === "patient" || req.user.role === "user") {
      appointments = await Appointment.find({ user: userId }).populate(
        "doctor user"
      );
    } else if (req.user.role === "doctor") {
      appointments = await Appointment.find({ doctor: userId }).populate(
        "doctor user"
      );
    } else {
      return res.status(403).json({ message: "Unauthorized user role" });
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET APPOINTMENTS BY USER ID (Admin or Doctor)
export const getAppointmentsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId; // FIXED

    const appointments = await Appointment.find({ user: userId }).populate(
      "doctor user"
    );

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET APPOINTMENTS BY DOCTOR ID
export const getAppointmentsByDoctorId = async (req, res) => {
  try {
    const doctorId = req.params.doctorId; // FIXED

    const appointments = await Appointment.find({ doctor: doctorId }).populate(
      "doctor user"
    );

    res.status(200).json(appointments);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET SINGLE APPOINTMENT
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "doctor user"
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE APPOINTMENT (Only DOCTOR + ADMIN)
export const updateAppointment = async (req, res) => {
  try {
    if (req.user.role === "patient") {
      return res
        .status(403)
        .json({ message: "Patients cannot update appointments" });
    }

    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("doctor user");

    if (!updated) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ DELETE APPOINTMENT
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET ALL APPOINTMENTS (Admin Only)
export const getAllAppointments = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const appointments = await Appointment.find().populate("doctor user");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
