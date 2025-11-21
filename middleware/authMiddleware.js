import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const id = decoded.userId;

    // Find user in User or Doctor table
    let user =
      (await User.findById(id).select("-password")) ||
      (await Doctor.findById(id).select("-password"));

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔥 Attach logged-in user info
    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || "user",
      // ⚠ doctorId required for doctor routes
      doctorId: user.role === "doctor" ? user._id.toString() : null,
    };

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Not authorized" });
  }
};
