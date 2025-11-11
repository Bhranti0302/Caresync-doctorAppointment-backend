import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    let token;

    // 1️⃣ Extract token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // 3️⃣ Lookup user in DB
    let user =
      (await User.findById(decoded.id).select("-password")) ||
      (await Doctor.findById(decoded.id).select("-password"));

    // 4️⃣ Fallback for hardcoded admin
    if (!user && decoded.id === "admin-id") {
      user = {
        _id: "admin-id",
        name: "Admin User",
        email: process.env.ADMIN_EMAIL || "admin@0320.com",
        role: "admin",
      };
    }

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 5️⃣ Attach to req.user
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
