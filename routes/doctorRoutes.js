import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  addDoctor,
  doctorController,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

// ✅ Any logged-in user can add a doctor (adjust as needed)
router.post("/add", protect, upload.single("image"), addDoctor);

// ✅ CRUD routes
router.get("/", protect, doctorController.getAll);
router.get("/:id", protect, doctorController.getById);
router.put(
  "/:id",
  protect,
  upload.single("image"),
  doctorController.updateById
);
router.delete("/:id", protect, doctorController.deleteById);

export default router;
