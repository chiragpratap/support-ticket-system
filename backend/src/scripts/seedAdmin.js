
import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password || password.length < 12) {
      throw new Error(
        "Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in .env"
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role !== "admin") {
        throw new Error(
          "This email belongs to a non-admin user. Choose a different email."
        );
      }

      console.log("Admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: "Support Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

await seedAdmin();
