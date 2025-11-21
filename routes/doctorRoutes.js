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
router.get("/:id", getDoctorById);

// 👑 ADMIN — Add doctor
router.post(
  "/",
  protect,
  allowRoles("admin"),
  upload.single("image"), // <== File field name must be `image`
  addDoctor
);

// 🗑 DELETE DOCTOR (ADMIN)
router.delete("/:id", protect, allowRoles("admin"), deleteDoctor);

// ✏ UPDATE (ADMIN + DOCTOR)
router.put(
  "/:id",
  protect,
  allowRoles("doctor", "admin"),
  upload.single("image"),
  updateDoctor
);

// 🔥 DOCTOR UPDATE OWN PROFILE
router.put(
  "/me/update",
  protect,
  allowRoles("doctor"),
  upload.single("image"),
  updateDoctorByMe
);

export default router;
