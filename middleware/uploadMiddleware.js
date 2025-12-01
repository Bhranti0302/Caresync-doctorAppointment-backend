import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// ✅ Cloudinary Configuration (Render safe)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "CareSync/doctors",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

// ✅ Multer config
const upload = multer({ storage });

export default upload;
