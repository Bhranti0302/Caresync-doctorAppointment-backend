import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  userController,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), userController.getAll);
router.get("/:id", protect, userController.getById);
router.put("/:id", protect, upload.single("image"), userController.updateById);
router.put("/profile", protect, upload.single("image"), updateUserProfile);
router.delete("/:id", protect, authorize("admin"), userController.deleteById);

export default router;
