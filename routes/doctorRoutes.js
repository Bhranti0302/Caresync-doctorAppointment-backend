import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  addDoctor,
  doctorController,
  updateDoctorDetails,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Only logged-in users can add new doctors
router.post("/add", protect, upload.single("image"), addDoctor);

// ✅ Anyone (even non-logged-in users) can view doctors
router.get("/", doctorController.getAll);
router.get("/:id", doctorController.getById);

// ✅ Only the doctor themself or admin can update doctor info
router.put("/:id", protect, upload.single("image"), updateDoctorDetails);

// ✅ Only admin can delete a doctor (optional; keep protect for now)
router.delete("/:id", protect, doctorController.deleteById);

export default router;
