import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";
import { createUpload } from "../middleware/uploadMiddleware.js";

import {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  deleteMyAccount,
} from "../controllers/userController.js";

const router = express.Router();
const uploadUser = createUpload("users");

// ==========================
// User self routes FIRST
// ==========================
router.get("/profile/me", protect, getUserProfile);

router.put(
  "/profile/me",
  protect,
  uploadUser.single("image"),
  (req, res, next) => {
   
    next();
  },
  updateUserProfile
);

router.delete("/me", protect, deleteMyAccount);

// ==========================
// Admin routes SECOND
// ==========================
router.get("/", protect, allowRoles("admin"), getAllUsers);
router.get("/:id", protect, allowRoles("admin"), getUserById);
router.delete("/:id", protect, allowRoles("admin"), deleteUser);

export default router;
