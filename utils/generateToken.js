import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign(
    { userId }, // ✅ MUST be userId to match your middleware
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};
