// controllers/bookingController.js

import Appointment from "../models/appointmentModel.js";
import mongoose from "mongoose";

// CREATE APPOINTMENT (PATIENT ONLY)
export const createAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res
        .status(403)
        .json({ message: "Only patients can book appointments" });
    }

    const { doctor, date, time, reason, fees } = req.body;

    if (!doctor || !date || !time || !fees) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prevent double booking of same slot
    const slotExists = await Appointment.findOne({ doctor, date, time });
    if (slotExists) {
      return res.status(400).json({ message: "This slot is already booked" });
    }

    const appointment = await Appointment.create({
      doctor,
      user: req.user.userId,
      date,
      time,
      reason,
      fees,
    });

    res.status(201).json(appointment);
  } catch (err) {
    console.error("Create appointment error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// GET APPOINTMENTS ONLY FOR SELECTED DOCTOR (for checking booked slots)


// GET all booked slots for a doctor
// Helper to get today in YYYY-MM-DD format
const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};


export const getDoctorAvailableSlots = async (req, res) => {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
      cancelled: false,
      date: { $gte: todayStr },
    }).select("date time");

    res.status(200).json(
      appointments.map((appt) => ({
        date: appt.date,
        time: appt.time,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};




// GET APPOINTMENTS FOR LOGGED-IN USER OR DOCTOR
export const getAppointmentsByMe = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === "patient") {
      appointments = await Appointment.find({
        user: req.user.userId,
      }).populate("doctor user");
    } else if (req.user.role === "doctor") {
      appointments = await Appointment.find({
        doctor: req.user.userId,
      }).populate("doctor user");
    } else {
      return res.status(403).json({ message: "Unauthorized user role" });
    }

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET APPOINTMENTS BY USER ID (ADMIN)
export const getAppointmentsByUserId = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.params.userId,
    }).populate("doctor user");

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET APPOINTMENTS BY DOCTOR ID (ADMIN)
export const getAppointmentsByDoctorId = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
    }).populate("doctor user");

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET SINGLE APPOINTMENT
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "doctor user"
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// UPDATE APPOINTMENT STATUS (DOCTOR OR ADMIN ONLY)
// UPDATE APPOINTMENT
export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Patients can only update the 'paid' field
    if (req.user.role === "patient") {
      if (!('paid' in req.body)) {
        return res.status(403).json({ message: "Patients cannot update this field" });
      }
    }

    // Doctors/Admin can update anything
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("doctor user");

    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ----------------------------
// UPDATE BOOKING
// ----------------------------
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const booking = await Appointment.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Only the patient who owns this booking can mark as paid
    if (
      req.user.role === "patient" &&
      booking.user.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this booking" });
    }

    // Only allow updating 'paid' field for patients
    if (req.user.role === "patient") {
      if (!("paid" in updateData)) {
        return res
          .status(403)
          .json({ message: "Patients can only update 'paid' field" });
      }
    }

    const updatedBooking = await Appointment.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("doctor user");

    res.status(200).json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};



// DELETE APPOINTMENT (PATIENT OWN, DOCTOR/ADMIN ANY)
export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (
      req.user.role === "patient" &&
      appointment.user.toString() !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ message: "Cannot delete others' appointments" });
    }

    await appointment.deleteOne();

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET ALL APPOINTMENTS (ADMIN ONLY)
export const getAllAppointments = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const appointments = await Appointment.find().populate("doctor user");

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
