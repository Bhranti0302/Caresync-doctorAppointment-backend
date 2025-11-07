import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * ✅ Protect route middleware
 * Works for all roles: user, doctor, and admin
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try finding in User or Doctor collection
      const user =
        (await User.findById(decoded.id).select("-password")) ||
        (await Doctor.findById(decoded.id).select("-password"));

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user; // ✅ Attach user info to request
      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

/**
 * ✅ Role-based access control
 * @param {...string} roles - allowed roles (e.g. "admin", "doctor", "user")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied: insufficient permissions",
      });
    }
    next();
  };
};
