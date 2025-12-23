import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";

// ✅ Dynamically load env file
const envFile =
  process.env.NODE_ENV === "production"
    ? "./.env.production"
    : "./.env.development";

dotenv.config({ path: envFile });


async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("❌ MONGO_URI missing");
    }

    await mongoose.connect(process.env.MONGO_URI);
   

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });
    if (existingAdmin) {
     
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const admin = await User.create({
      name: "Admin",
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

   
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
