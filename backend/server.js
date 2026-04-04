import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import reviewRoutes from "./routes/review.route.js";
import productRoutes from "./routes/product.route.js";
import dns from "dns";

dns.setServers(["1.1.1.1", "8.8.8.8"]);
dotenv.config();

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

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);

// Multer/Cloudinary errors call next(err); without this, clients get no JSON `message`.
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  console.error(err);

  const status =
    err.status || err.statusCode || (err.name === "MulterError" ? 400 : 500);
  const code = status >= 400 && status < 600 ? status : 500;

  const nested = err?.error;
  const msg =
    (typeof err?.message === "string" && err.message.trim() && err.message) ||
    (typeof nested === "string" && nested) ||
    (nested && typeof nested === "object" && nested.message) ||
    (err?.name === "MulterError" && err.code
      ? `Upload error (${err.code})`
      : null);

  res.status(code).json({
    success: false,
    message:
      msg ||
      "Image upload failed. If CLOUDINARY_* is missing or wrong in .env, set valid keys or rely on local disk (no Cloudinary vars).",
  });
});

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
