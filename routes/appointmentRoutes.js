import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDoctor,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create appointment (user only)
router.post("/", protect, createAppointment);

// ✅ Get all appointments (admin sees all, doctor sees their own, user sees own)
router.get("/", protect, getAllAppointments);

// ✅ Get appointment by ID
router.get("/:id", protect, getAppointmentById);

// ✅ Update appointment (doctor/admin only)
router.put("/:id", protect, updateAppointment);

// ✅ Delete appointment (admin only)
router.delete("/:id", protect, deleteAppointment);

// ✅ Get appointments by doctor
router.get("/doctor/:doctorId", protect, getAppointmentsByDoctor);

export default router;
