// controllers/bookingController.js
import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";

// --- GET ALL ---
export const getAll = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate("doctor user");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET BY ID ---
export const getById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "doctor user"
    );
    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- DELETE ---
export const deleteById = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- CREATE ---
export const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;
    const doctorData = await Doctor.findById(doctor);
    if (!doctorData)
      return res.status(404).json({ message: "Doctor not found" });

    const newAppointment = await Appointment.create({
      doctor,
      user: req.user._id,
      date,
      time,
      reason,
      fees: doctorData.fees,
    });

    res
      .status(201)
      .json({ message: "Created successfully", appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- UPDATE ---
export const updateAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET BY USER ---
export const getByUserId = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      user: req.params.userId,
    }).populate("doctor");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GET BY DOCTOR ---
export const getByDoctorId = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.params.doctorId,
    }).populate("user");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
