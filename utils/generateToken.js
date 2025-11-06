import jwt from "jsonwebtoken";

/**
 * Generate a JWT token for a given user ID.
 * @param {string} id - MongoDB user ID
 * @returns {string} - Signed JWT token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d", // token validity
  });
};
