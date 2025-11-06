import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Doctor from "../models/doctorModel.js";
import { generateToken } from "../utils/generateToken.js";

// 🧾 USER SIGNUP
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender, address, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      address,
      phone,
      role: "patient",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        token: generateToken(newUser._id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 🔐 LOGIN for User / Doctor / Admin
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🧑‍💼 Admin Login
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET);
      return res.status(200).json({
        message: "Admin login successful",
        role: "admin",
        token,
      });
    }

    // 👨‍⚕️ Doctor Login
    const doctor = await Doctor.findOne({ email });
    if (doctor) {
      const match = await bcrypt.compare(password, doctor.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      return res.status(200).json({
        message: "Doctor login successful",
        role: "doctor",
        user: doctor,
        token: generateToken(doctor._id),
      });
    }

    // 👤 User Login
    const user = await User.findOne({ email });
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(400).json({ message: "Invalid credentials" });

      return res.status(200).json({
        message: "User login successful",
        role: "patient",
        user,
        token: generateToken(user._id),
      });
    }

    res.status(404).json({ message: "Account not found" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
