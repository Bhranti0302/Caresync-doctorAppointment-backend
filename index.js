import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

// -----------------------------------------------------------------------------
// 1️⃣ Environment Configuration
// -----------------------------------------------------------------------------
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

// console.log("✅ Loaded ENV:", {
//   CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
//   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
//   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
//     ? "✅ Exists"
//     : "❌ Missing",
// });

// -----------------------------------------------------------------------------
// 2️⃣ Express App Initialization
// -----------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------
// 3️⃣ MongoDB Connection
// -----------------------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log(`✅ MongoDB Connected (${process.env.NODE_ENV.toUpperCase()})`)
  )
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// -----------------------------------------------------------------------------
// 4️⃣ Serve Uploaded Images (IMPORTANT FOR RENDER)
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve the /uploads folder publicly
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Ensure uploads folder exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log("📁 'uploads' folder created automatically.");
}

// -----------------------------------------------------------------------------
// 5️⃣ API Routes
// -----------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("🚀 CareSync Backend Running Successfully!");
});

// ✅ Route logging for debugging
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

// -----------------------------------------------------------------------------
// 6️⃣ Error Handling
// -----------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ✅ ENHANCED GLOBAL ERROR HANDLER (adds better logs)
app.use((err, req, res, next) => {
  // console.error("🔥 GLOBAL ERROR HANDLER:");
  // console.error("➡️ Name:", err?.name);
  // console.error("➡️ Message:", err?.message);
  // console.error("➡️ Stack:", err?.stack);
  // console.error("➡️ Full Error Object:", err);

  res.status(500).json({
    success: false,
    message: err?.message || "Something went wrong",
    error: err,
  });
});

// -----------------------------------------------------------------------------
// 7️⃣ Server Start
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
