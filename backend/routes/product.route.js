import express from "express";
import multer from "multer";
import path from "path";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  getProductCategories,
  getProductsByCategory,
  getPublicProducts,
  suggestProductPrice,
  updateProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

// Temporary fake middleware/////////////////////////////////////////////////////////////////////////////////
const protectRoute = (req, res, next) => {
  req.user = { id: "123", role: "admin" }; // fake logged-in user
  next();
};
const adminRoute = (req, res, next) => {
  next(); // let everything pass
};
// Temporary fake middleware/////////////////////////////////////////////////////////////////////////////////

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, "backend/uploads/products");
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path
      .basename(file.originalname, ext)
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const productImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = [".jpg", ".jpeg", ".png", ".webp"];
    if (!ok.includes(ext)) {
      return cb(new Error("Invalid image format. Use jpg, jpeg, png, webp."));
    }
    cb(null, true);
  },
});

/** Predefined categories for dropdowns (no auth). */
router.get("/categories", getProductCategories);

/** Public shop listing: Available, not past 3‑month window; optional ?category= */
router.get("/public", getPublicProducts);

/** Browse by category path, e.g. /category/Mobile%20Phones */
router.get("/category/:category", getProductsByCategory);

/** Seller’s listings; ?sellerId= until auth provides user */
router.get("/my", getMyProducts);

// Create product with uploaded image file (multipart/form-data)
router.post("/", productImageUpload.single("image"), createProduct);

/** Existing: returns all documents (unchanged contract). */
router.get("/", protectRoute, adminRoute, getAllProducts);

router.get("/:id", getProductById);
// Update product. Image is optional on edit.
router.put("/:id", productImageUpload.single("image"), updateProduct);

// Smart price suggestion (non-AI, based on your current listings)
router.post("/suggest-price", suggestProductPrice);
router.delete("/:id", deleteProduct);

export default router;
