import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDoctorId,
  getAppointmentsByUserId,
  getAppointmentsByMe,
} from "../controllers/bookingController.js";

import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ---------------- PATIENT ----------------
router.post("/", protect, allowRoles("patient"), createAppointment);

router.get(
  "/user/:userId",
  protect,
  allowRoles("patient", "admin"),
  getAppointmentsByUserId
);

router.delete(
  "/:id",
  protect,
  allowRoles("patient", "admin"),
  deleteAppointment
);

// ---------------- DOCTOR ----------------
router.get(
  "/doctor/:doctorId",
  protect,
  allowRoles("doctor", "admin"),
  getAppointmentsByDoctorId
);

router.put("/:id", protect, allowRoles("doctor", "admin"), updateAppointment);

// ---------------- BOTH ----------------
router.get(
  "/me",
  protect,
  allowRoles("patient", "doctor"),
  getAppointmentsByMe
);

// ---------------- ALL ----------------
router.get("/", protect, getAllAppointments);

// ⚠ IMPORTANT: always last!
router.get("/:id", protect, getAppointmentById);

export default router;
