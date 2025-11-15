import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Helper to create cookie
const sendTokenResponse = (res, user, message) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 🔥 Set JWT cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return res.status(200).json({
    message,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

// -----------------------------
// REGISTER
// -----------------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    let existing =
      (await User.findOne({ email })) || (await Doctor.findOne({ email }));

    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      role: role || "patient",
    });

    sendTokenResponse(res, newUser, "Registered successfully!");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// -----------------------------
// LOGIN
// -----------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // false for localhost
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// -----------------------------
// LOGOUT
// -----------------------------
export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
};

// OPTIONAL: forgot + reset password...
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // ⭐ Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // ⭐ Hash token before saving to DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // ⭐ Reset URL (Frontend)
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // ⭐ Email message
    const message = `
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetURL}" target="_blank">${resetURL}</a>
      <p>This link is valid for 10 minutes.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Reset Instructions",
      html: message,
    });

    res.status(200).json({
      message: "Password reset email sent successfully!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ---------------------------------------------
// 📌 RESET PASSWORD — Validate Token & Update Password
// ---------------------------------------------
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // URL token
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ message: "Password is required" });

    // ⭐ Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // ⭐ Find user with valid token (not expired)
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    // ⭐ Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful! You can now log in.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
