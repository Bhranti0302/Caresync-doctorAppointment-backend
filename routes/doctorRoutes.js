import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getAllDoctors,
  getDoctorById,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  updateDoctorByMe,
} from "../controllers/doctorController.js";

const router = express.Router();

// 🌍 PUBLIC
router.get("/", getAllDoctors);

// 🔥 DOCTOR UPDATE OWN PROFILE (MUST BE BEFORE /:id)
router.put(
  "/me/update",
  protect,
  allowRoles("doctor"),
  upload.single("image"),
  updateDoctorByMe
);

// 👑 ADMIN — Add doctor
router.post(
  "/",
  protect,
  allowRoles("admin"),
  upload.single("image"),
  addDoctor
);

// ✏ UPDATE (ADMIN + DOCTOR)
router.put(
  "/:id",
  protect,
  allowRoles("doctor", "admin"),
  upload.single("image"),
  updateDoctor
);

// 🗑 DELETE DOCTOR (ADMIN)
router.delete("/:id", protect, allowRoles("admin"), deleteDoctor);

// Get doctor by id (KEEP LAST)
router.get("/:id", getDoctorById);

export default router;
