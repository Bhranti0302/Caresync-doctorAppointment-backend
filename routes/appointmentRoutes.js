import express from "express";
import {
  createAppointment,
  getAppointmentsByMe,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAllAppointments,
  updateBooking,getAppointmentsByDoctorId,
  getDoctorAvailableSlots,

} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Patient: create appointment
router.post("/", protect, allowRoles("patient"), createAppointment);

// Get logged-in user appointments
router.get("/me", protect, allowRoles("patient", "doctor"), getAppointmentsByMe);

// Get doctor available slots (for booking)
router.get(
  "/doctor-slots/:doctorId",
  protect,
  allowRoles("admin", "doctor", "patient"),
  getDoctorAvailableSlots
);

// Get appointments by doctor ID (admin/doctor)
router.get("/doctor/:doctorId", protect, allowRoles("admin", "doctor"), getAppointmentsByDoctorId);

// Get single appointment
router.get("/:id", protect, getAppointmentById);

// Patient: pay for appointment
router.put("/:id/pay", protect, allowRoles("patient"), updateBooking);

// Update appointment (doctor/admin only)
router.put("/:id", protect, allowRoles("doctor", "admin"), updateAppointment);

// Delete appointment
router.delete("/:id", protect, deleteAppointment);

// Admin: get all appointments
router.get("/", protect, allowRoles("admin"), getAllAppointments);



export default router;
