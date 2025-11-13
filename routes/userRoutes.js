import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import {
  addUser,
  userController,
  updateUserDetails,
} from "../controllers/userController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// ✅ Routes
router.get("/", protect, userController.getAll);
router.get("/:id", protect, userController.getById);
router.post("/", upload.single("image"), addUser);
router.put("/:id", protect, upload.single("image"), updateUserDetails);
router.delete("/:id", protect, userController.deleteById);

export default router;
