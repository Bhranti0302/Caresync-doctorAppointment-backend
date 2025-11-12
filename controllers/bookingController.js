import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import mongoose from "mongoose";

const ObjectId = mongoose.Types.ObjectId;

// -------------------- CREATE APPOINTMENT --------------------
export const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;

    if (req.user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "Only patients can book appointments" });
    }

    const doctorData = await Doctor.findById(doctor);
    if (!doctorData)
      return res.status(404).json({ message: "Doctor not found" });

    const newAppointment = await Appointment.create({
      doctor: new ObjectId(doctor),
      user: new ObjectId(req.user.id),
      date,
      time,
      reason,
      fees: doctorData.fees,
    });

    await newAppointment.populate("doctor").populate("user");

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
    let appointments;

    if (req.user.role === "admin") {
      appointments = await Appointment.find().populate("doctor user");
    } else if (req.user.role === "doctor") {
      appointments = await Appointment.find({ doctor: req.user.id }).populate(
        "doctor user"
      );
    } else {
      appointments = await Appointment.find({ user: req.user.id }).populate(
        "doctor user"
      );
    }

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- GET APPOINTMENT BY ID --------------------
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "doctor user"
    );
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.user.role === "patient" &&
      appointment.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- UPDATE APPOINTMENT --------------------
export const updateAppointment = async (req, res) => {
  try {
    const updates = req.body;

    if (!["doctor", "admin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Only doctor or admin can update appointment" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (
      req.user.role === "doctor" &&
      appointment.doctor.toString() !== req.user.id
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

    res.status(200).json(appointment);
  } catch (error) {
    console.error("❌ Error updating appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- DELETE APPOINTMENT --------------------
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can delete appointments" });
    }

    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- GET APPOINTMENTS BY DOCTOR ID --------------------
export const getAppointmentsByDoctorId = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
    }).populate("doctor user");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// -------------------- GET APPOINTMENTS BY USER ID --------------------
export const getAppointmentsByUserId = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.params.userId,
    }).populate("doctor user");

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
