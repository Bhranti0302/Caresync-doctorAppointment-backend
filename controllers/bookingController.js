import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

// -------------------- CREATE APPOINTMENT --------------------
export const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;

    if (req.user.role !== "user") {
      return res
        .status(403)
        .json({ message: "Only users can book appointments" });
    }

    if (!ObjectId.isValid(doctor)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const doctorData = await Doctor.findById(doctor);
    if (!doctorData)
      return res.status(404).json({ message: "Doctor not found" });

    const newAppointment = await Appointment.create({
      doctor: doctorData._id,
      user: req.user._id,
      date,
      time,
      reason,
      fees: doctorData.fees,
      status: "pending",
    });

    await newAppointment.populate("doctor user");

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("❌ Error creating appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- GET ALL APPOINTMENTS --------------------
export const getAllAppointments = async (req, res) => {
  try {
    const userId = req.user._id;

    let appointments;
    if (req.user.role === "admin") {
      appointments = await Appointment.find().populate("doctor user");
    } else if (req.user.role === "doctor") {
      appointments = await Appointment.find({ doctor: userId }).populate(
        "doctor user"
      );
    } else {
      appointments = await Appointment.find({ user: userId }).populate(
        "doctor user"
      );
    }

    res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Error getting appointments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- GET APPOINTMENT BY ID --------------------
export const getAppointmentById = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user._id;

    if (!ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findById(appointmentId).populate(
      "doctor user"
    );
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    // Only the user who booked, doctor, or admin can view
    if (
      req.user.role === "user" &&
      appointment.user._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (
      req.user.role === "doctor" &&
      appointment.doctor._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    console.error("❌ Error getting appointment by ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- UPDATE APPOINTMENT --------------------
export const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const updates = req.body;
    const userId = req.user._id;

    if (!ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    if (!["doctor", "admin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Only doctor or admin can update appointments" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Doctor can only update their own appointments" });
    }

    Object.keys(updates).forEach((key) => {
      appointment[key] = updates[key];
    });

    await appointment.save();
    await appointment.populate("doctor user");

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment,
    });
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- DELETE APPOINTMENT --------------------
export const deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const userId = req.user._id;

    if (!ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.user.role !== "admin" &&
      appointment.user.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to cancel this appointment" });
    }

    await Appointment.findByIdAndDelete(appointmentId);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- GET APPOINTMENTS BY DOCTOR ID --------------------
export const getAppointmentsByDoctorId = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    if (!ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const appointments = await Appointment.find({ doctor: doctorId }).populate(
      "doctor user"
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Error getting appointments by doctor ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- GET APPOINTMENTS BY USER ID --------------------
export const getAppointmentsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const appointments = await Appointment.find({ user: userId }).populate(
      "doctor user"
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error("❌ Error getting appointments by user ID:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
