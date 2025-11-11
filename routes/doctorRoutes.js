import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  addDoctor,
  updateDoctorDetails,
  doctorController,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Add Doctor (with authentication and image upload)
router.post("/add", protect, upload.single("image"), addDoctor);

// ✅ Get all doctors
router.get("/", doctorController.getAll);

// ✅ Get doctor by ID
router.get("/:id", doctorController.getById);

// ✅ Update doctor details
router.put("/:id", protect, upload.single("image"), updateDoctorDetails);

// ✅ Delete doctor
router.delete("/:id", protect, doctorController.deleteById);

export default router;
