import mongoose from "mongoose";
import dns from "node:dns";

// Some ISP/router DNS resolvers reject SRV lookups used by mongodb+srv URIs.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB", error.message);
    process.exit(1);
  }
};
