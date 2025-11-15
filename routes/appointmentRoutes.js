import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDoctorId,
  getAppointmentsByUserId,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

//  Create appointment (user only)
router.post("/", protect, createAppointment);

// Get appointments by doctor ID
router.get("/doctor/:doctorId", protect, getAppointmentsByDoctorId);

//  Get appointments by user ID
router.get("/user/:userId", protect, getAppointmentsByUserId);

//  Get appointment by appointment ID
router.get("/:id", protect, getAppointmentById);

//  Get all appointments (admin/doctor/user filtered)
router.get("/", protect, getAllAppointments);

// Update appointment (doctor/admin only)
router.put("/:id", protect, updateAppointment);

//  Delete appointment (user/admin)
router.delete("/:id", protect, deleteAppointment);

export default router;
