import express from "express";
import { registerUser, login } from "../controllers/authController.js";

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login (for User / Doctor / Admin)
router.post("/login", login);

export default router;
