import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// Middleware
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

// -----------------------------------------------------------------------------
// 1️⃣ Load environment-specific configuration
// -----------------------------------------------------------------------------
dotenv.config({ path: `.env.${process.env.NODE_ENV || "development"}` });

// -----------------------------------------------------------------------------
// 2️⃣ Initialize Express
// -----------------------------------------------------------------------------
const app = express();

app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------
// 3️⃣ Connect MongoDB
// -----------------------------------------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log(`✅ MongoDB Connected (${process.env.NODE_ENV.toUpperCase()})`)
  )
  .catch((err) => console.error("❌ MongoDB Connection Error:", err.message));

// -----------------------------------------------------------------------------
// 4️⃣ Static File Serving
// -----------------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// -----------------------------------------------------------------------------
// 5️⃣ API Routes
// -----------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("🚀 CareSync Backend Running Successfully!");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

// -----------------------------------------------------------------------------
// 6️⃣ Error Handling Middleware
// -----------------------------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// -----------------------------------------------------------------------------
// 7️⃣ Server Listen
// -----------------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  console.log(`🔗 Base URL: ${BASE_URL}`);
});
