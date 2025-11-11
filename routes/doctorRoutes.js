import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  addDoctor,
  updateDoctorDetails,
  doctorController,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Diagnostic route logging
router.post(
  "/add",
  (req, res, next) => {
    console.log("🟢 Incoming /api/doctors/add request");
    next();
  },
  protect,
  (req, res, next) => {
    console.log("🧩 After protect middleware:", req.user);
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    console.log("📸 File received in route:", req.file);
    next();
  },
  addDoctor
);

router.get("/", doctorController.getAll);
router.get("/:id", doctorController.getById);
router.put("/:id", protect, upload.single("image"), updateDoctorDetails);
router.delete("/:id", protect, doctorController.deleteById);

export default router;
