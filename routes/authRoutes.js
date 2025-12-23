import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { createUpload } from "../middleware/uploadMiddleware.js";

const router = express.Router();



// Register (with optional image)
router.post(
  "/register",
  createUpload("users").single("image"),
  (req, res, next) => {
   
    next();
  },
  registerUser
);

// Login
router.post("/login", loginUser);

// Logout
router.post("/logout", protect, logoutUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.put("/reset-password/:token", resetPassword);

export default router;
