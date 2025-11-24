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

dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------
// 🔥 CORS CONFIG (support localhost + live)
// ---------------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local frontend
      "https://YOUR_FRONTEND_URL", // ← replace with deployed frontend URL
    ],
    credentials: true,
  })
);

// ---------------------------------------------
app.use(cookieParser());

// ---------------------------------------------
// Static upload folder for images
// ---------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// ---------------------------------------------
// ROUTES
// ---------------------------------------------
app.get("/", (req, res) => res.send("Backend Running 🚀"));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/appointments", appointmentRoutes);

// ---------------------------------------------
// ERROR HANDLERS
// ---------------------------------------------
app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------
// PRODUCTION FRONTEND SUPPORT
// ---------------------------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"))
  );
}

// ---------------------------------------------
// DATABASE + SERVER
// ---------------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () =>
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV} on port ${PORT}`
      )
    );
  })
  .catch((err) => console.error("❌ DB ERROR:", err.message));
