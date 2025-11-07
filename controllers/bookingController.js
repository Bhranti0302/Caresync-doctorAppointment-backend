import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import { createBaseController } from "./baseController.js";

export const bookingController = createBaseController(Appointment, [
  { path: "doctor", select: "name speciality" },
  { path: "user", select: "name email" },
]);

// ✅ Create a new appointment
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

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update appointment
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

// ✅ Get appointments by user ID
export const getByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.role === "user" && req.user._id.toString() !== userId)
      return res.status(403).json({ message: "Access denied" });

    const appointments = await Appointment.find({ user: userId }).populate(
      "doctor"
    );
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error });
  }
};

// ✅ Get appointments by doctor ID
export const getByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (req.user.role === "doctor" && req.user._id.toString() !== doctorId)
      return res.status(403).json({ message: "Access denied" });

    const appointments = await Appointment.find({ doctor: doctorId }).populate(
      "user"
    );
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch appointments", error });
  }
};
