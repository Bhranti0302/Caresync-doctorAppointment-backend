import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  addDoctor,
  doctorController,
} from "../controllers/doctorController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Add doctor (with image)
router.post(
  "/add",
  protect,
  authorize("admin"),
  upload.single("image"),
  addDoctor
);

// CRUD
router.get("/", protect, authorize("admin"), doctorController.getAll);
router.get("/:id", protect, doctorController.getById);
router.put(
  "/:id",
  protect,
  upload.single("image"),
  doctorController.updateById
);
router.delete("/:id", protect, authorize("admin"), doctorController.deleteById);

export default router;
