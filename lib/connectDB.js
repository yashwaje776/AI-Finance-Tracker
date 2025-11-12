import mongoose from "mongoose";
const uri = process.env.MONGODB_URI;
export async function connectDB() {
  if (!uri) {
    throw new Error("❌ Missing MONGODB_URI in environment variables");
  }
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("✅ MongoDB already connected");
      return;
    }
    await mongoose.connect(uri);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
}
