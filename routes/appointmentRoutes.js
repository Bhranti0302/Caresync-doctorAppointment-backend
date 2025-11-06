import express from "express";
import {
  bookingController,
  createAppointment,
  updateAppointment,
} from "../controllers/bookingController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only authenticated users can create appointments
router.get(
  "/",
  protect,
  authorize("admin", "doctor"),
  bookingController.getAll
);
router.get("/:id", protect, bookingController.getById);
router.post("/", protect, authorize("patient"), createAppointment);
router.put("/:id", protect, authorize("doctor", "admin"), updateAppointment);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  bookingController.deleteById
);

export default router;
