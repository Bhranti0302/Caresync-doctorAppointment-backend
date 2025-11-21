import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

import {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  deleteMyAccount,
  getUserById,
} from "../controllers/userController.js";

const router = express.Router();

// ---------------- ADMIN ROUTES ----------------
router.get("/all-users", protect, allowRoles("admin"), getAllUsers);
router.get("/:id", protect, allowRoles("admin"), getUserById);

// ---------------- USER SELF ROUTES ----------------
router.get("/me/profile", protect, allowRoles("patient"), getUserProfile);
router.put(
  "/me/update-profile",
  protect,
  allowRoles("patient"),
  upload.single("profileImage"),
  updateUserProfile
);
router.delete("/me/delete", protect, allowRoles("patient"), deleteMyAccount);

export default router;
