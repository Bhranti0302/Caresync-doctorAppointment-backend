import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  updateUserDetails,
  userController,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Get all users
router.get("/", userController.getAll);

// ✅ Get user by ID
router.get("/:id", userController.getById);

// ✅ Update user details (with image upload)
router.put("/:id", protect, upload.single("image"), updateUserDetails);

// ✅ Delete user
router.delete("/:id", protect, userController.deleteById);

export default router;
