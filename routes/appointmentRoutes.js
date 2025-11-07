import express from "express";
import {
  getAll,
  getById,
  getByUserId,
  getByDoctorId,
  createAppointment,
  updateAppointment,
  deleteById,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAll);
router.get("/:id", protect, getById);
router.get("/user/:userId", protect, getByUserId);
router.get("/doctor/:doctorId", protect, getByDoctorId);
router.post("/", protect, createAppointment);
router.put("/:id", protect, updateAppointment);
router.delete("/:id", protect, deleteById);

export default router;
