import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  logoutUser,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// -------------------------
// 🚀 PUBLIC AUTH ROUTES
// -------------------------

// Register (patient & doctor both handled by controller)
router.post("/register", registerUser);

// Login (for patient + doctor)
router.post("/login", loginUser);

// Forgot password (generates reset token)
router.post("/forgot-password", forgotPassword);

// Reset password using token
router.post("/reset-password/:token", resetPassword);

// -------------------------
// 🔐 PRIVATE AUTH ROUTES
// -------------------------

// Get logged-in user details (auto detects patient/doctor)
router.get("/me", protect, (req, res) => {
  res.status(200).json(req.user);
});

// Logout (patient + doctor)
router.post("/logout", protect, logoutUser);

export default router;
