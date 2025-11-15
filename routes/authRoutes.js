import express from "express";
import {
  registerUser,
  login,
  forgotPassword,
  resetPassword,
  logout,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/register", registerUser);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Private Route (requires cookie)
router.get("/me", protect, (req, res) => {
  res.status(200).json(req.user);
});

// Logout
router.post("/logout", logout);

export default router;
