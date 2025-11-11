import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  userController,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin)
 * @access  Private
 */
router.get("/", protect, userController.getAll);

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID
 * @access  Private
 */
router.get("/:id", protect, userController.getById);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (Admin)
 * @access  Private
 */
router.put("/:id", protect, upload.single("image"), userController.updateById);

/**
 * @route   PUT /api/users/profile
 * @desc    Update logged-in user’s profile
 * @access  Private
 */
router.put("/profile", protect, upload.single("image"), updateUserProfile);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user (Admin)
 * @access  Private
 */
router.delete("/:id", protect, userController.deleteById);

export default router;
