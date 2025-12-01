import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

// Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

/* ✅ Load correct .env file */
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

const app = express();

// Body & cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ CORS — FIXED
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://www.caresync.dev", // ✅ your real frontend
      "https://caresync-doctorappointment.onrender.com",
    ],
    credentials: true,
  })
);

// Optional: static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debug
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ Missing");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "Backend is running ✅" });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// MongoDB connection
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not set");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB ERROR:", err.message);
    process.exit(1);
  });
