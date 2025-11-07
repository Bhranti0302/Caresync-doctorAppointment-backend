import express from "express";
import {
  bookingController,
  createAppointment,
  updateAppointment,
  getByUserId,
  getByDoctorId,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Admin & Doctor can view all appointments
router.get(
  "/",
  protect,
  authorize("admin", "doctor"),
  bookingController.getAll
);

// ✅ Get appointments by user (patient) ID — must come BEFORE "/:id"
router.get("/user/:userId", protect, authorize("user", "admin"), getByUserId);

// ✅ Get appointments by doctor ID — must come BEFORE "/:id"
router.get(
  "/doctor/:doctorId",
  protect,
  authorize("doctor", "admin"),
  getByDoctorId
);

// ✅ Get appointment by booking ID
router.get("/:id", protect, bookingController.getById);

// ✅ Create a new appointment — only users (patients)
router.post("/", protect, authorize("user"), createAppointment);

// ✅ Update appointment — only doctor or admin
router.put("/:id", protect, authorize("doctor", "admin"), updateAppointment);

// ✅ Delete appointment — only admin
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  bookingController.deleteById
);

export default router;
