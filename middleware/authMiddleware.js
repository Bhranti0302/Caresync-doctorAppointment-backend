import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import dotenv from "dotenv";

dotenv.config();

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 🔍 Try to find user or doctor in DB
      let user =
        (await User.findById(decoded.id).select("-password")) ||
        (await Doctor.findById(decoded.id).select("-password"));

      // 🧩 Fallback for hardcoded admin
      if (!user && decoded.id === "admin-id") {
        user = {
          _id: "admin-id",
          name: "Admin User",
          email: "admin@0320.com",
          role: "admin",
        };
      }

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        id: user._id,
        email: user.email,
        role: user.role || "user",
        name: user.name,
      };

      next();
    } else {
      return res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
