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

// Create appointment
router.post("/", protect, createAppointment);

// Get all appointments
router.get("/", protect, getAllAppointments);

// Get appointment by ID
router.get("/:id", protect, getAppointmentById);

// Get appointments by doctor ID
router.get("/doctor/:doctorId", protect, getAppointmentsByDoctorId);

// Get appointments by user ID
router.get("/user/:userId", protect, getAppointmentsByUserId);

// Update appointment
router.put("/:id", protect, updateAppointment);

// Delete appointment
router.delete("/:id", protect, deleteAppointment);

export default router;
