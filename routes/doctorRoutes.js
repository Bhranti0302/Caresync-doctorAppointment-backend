// routes/doctorRoutes.js

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { createUpload } from "../middleware/uploadMiddleware.js";

import {
  getAllDoctors,
  getDoctorById,
  addDoctor,
  updateDoctor,
  updateDoctorByMe,
  deleteDoctor
} from "../controllers/doctorController.js";

const router = express.Router();
const uploadDoctor = createUpload("doctors");

// Get all doctors (Public)
router.get("/", getAllDoctors);

// Get single doctor by ID (Public)
router.get("/:id", getDoctorById);

// Add doctor (Admin)
router.post("/", protect, allowRoles("admin"), uploadDoctor.single("image"), addDoctor);

// Update doctor (Admin)
router.put("/:id", protect, allowRoles("admin","doctor"), uploadDoctor.single("image"), updateDoctor);

// Update own profile (Doctor)
router.put("/me/profile", protect, allowRoles("doctor"), uploadDoctor.single("image"), updateDoctorByMe);

// Delete doctor (Admin)
router.delete("/:id", protect, allowRoles("admin"), deleteDoctor);

export default router;
