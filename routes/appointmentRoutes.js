import express from "express";
import {
  bookingController,
  createAppointment,
  updateAppointment,
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

// ✅ Get appointments by booking ID
router.get("/:id", protect, bookingController.getById);

// ✅ NEW: Get appointments by patient ID (only that patient or admin)
router.get(
  "/user/:userId",
  protect,
  authorize("patient", "admin"),
  bookingController.getByUserId
);

// ✅ NEW: Get appointments by doctor ID (only that doctor or admin)
router.get(
  "/doctor/:doctorId",
  protect,
  authorize("doctor", "admin"),
  bookingController.getByDoctorId
);

// ✅ Create new appointment (only patients)
router.post("/", protect, authorize("patient"), createAppointment);

// ✅ Update appointment (doctor or admin)
router.put("/:id", protect, authorize("doctor", "admin"), updateAppointment);

// ✅ Delete appointment (admin only)
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  bookingController.deleteById
);

export default router;
