import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/** Cloudinary URLs stay as-is; local disk files become `/uploads/{folder}/...` for serving. */
export const mapUploadedImageUrls = (files, folder = "UniMart_Reviews") => {
  if (!files?.length) return [];
  return files.map((file) => {
    const p = file.path || "";
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    return `/uploads/${folder}/${file.filename}`;
  });
};

const createCloudinaryUpload = (folder = "UniMart_Reviews") => {
  if (cloudinaryConfigured) {
    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder,
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      },
    });
    return multer({ storage });
  }

  const uploadDir = path.join(process.cwd(), "uploads", folder);
  fs.mkdirSync(uploadDir, { recursive: true });
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".bin";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter: (_req, file, cb) => {
      const ok = /\.(jpe?g|png|webp)$/i.test(file.originalname);
      cb(null, ok);
    },
  });
};

const upload = createCloudinaryUpload();

export { createCloudinaryUpload };
export default upload;
