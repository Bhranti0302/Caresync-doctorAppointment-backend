import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// ✅ Load correct environment file
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv.config({ path: envFile });

console.log(`🌍 Loaded environment: ${process.env.NODE_ENV || "development"}`);
console.log("✅ Cloudinary ENV Check:", {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "❌ Missing",
  API_KEY: process.env.CLOUDINARY_API_KEY ? "✅ Exists" : "❌ Missing",
  API_SECRET: process.env.CLOUDINARY_API_SECRET ? "✅ Exists" : "❌ Missing",
});

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    console.log("☁️ Uploading to Cloudinary...");
    return {
      folder: "CareSync/doctors",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 500, height: 500, crop: "limit" }],
      public_id: file.originalname.split(".")[0],
    };
  },
});

// ✅ Multer Middleware
const upload = multer({ storage });

export default upload;
