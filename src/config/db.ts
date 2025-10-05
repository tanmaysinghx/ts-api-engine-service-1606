import mongoose from "mongoose";

export async function connectToDatabase(): Promise<void> {
  try {
    const uri = process.env.DB_URI || "";
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB:", uri);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
}