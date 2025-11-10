import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  userController,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, userController.getAll);
router.get("/:id", protect, userController.getById);
router.put("/:id", protect, upload.single("image"), userController.updateById);
router.put("/profile", protect, upload.single("image"), updateUserProfile);
router.delete("/:id", protect, userController.deleteById);

export default router;
