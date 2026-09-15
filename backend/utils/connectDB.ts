import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO as string;
    await mongoose.connect(mongoUrl);
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.log("MONGODB CONNECTION ERROR", err);
  }
};

export default connectDB;