import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import dns from "dns";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";

dotenv.config();

// Some networks fail mongodb+srv (SRV) lookups on the system DNS resolver.
// Set USE_PUBLIC_DNS=true in .env only when you see querySrv ECONNREFUSED for Atlas.
if (process.env.USE_PUBLIC_DNS === "true" || process.env.USE_PUBLIC_DNS === "1") {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Fix
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
