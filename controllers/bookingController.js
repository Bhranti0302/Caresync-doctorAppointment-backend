import Appointment from "../models/appointmentModel.js";
import Doctor from "../models/doctorModel.js";
import { createBaseController } from "./baseController.js";

export const bookingController = createBaseController(Appointment, [
  { path: "doctor", select: "name speciality" },
  { path: "user", select: "name email" },
]);

export const createAppointment = async (req, res) => {
  try {
    const { doctor, date, time, reason } = req.body;

    // ✅ Doctor must exist
    const doctorData = await Doctor.findById(doctor);
    if (!doctorData)
      return res.status(404).json({ message: "Doctor not found" });

    // ✅ Create appointment with logged-in user (from token)
    const newAppointment = await Appointment.create({
      doctor,
      user: req.user._id, // ✅ use req.user (from token)
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
