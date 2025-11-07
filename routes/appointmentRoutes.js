import express from "express";
import {
  bookingController,
  createAppointment,
  updateAppointment,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all appointments (for logged-in user)
router.get("/", protect, bookingController.getAll);

// Get appointment by ID
router.get("/:id", protect, bookingController.getById);

// Get appointments by user ID
router.get("/user/:userId", protect, bookingController.getByUserId);

// Get appointments by doctor ID
router.get("/doctor/:doctorId", protect, bookingController.getByDoctorId);

// Create new appointment
router.post("/", protect, createAppointment);

// Update appointment
router.put("/:id", protect, updateAppointment);

// Delete appointment
router.delete("/:id", protect, bookingController.deleteById);

export default router;
