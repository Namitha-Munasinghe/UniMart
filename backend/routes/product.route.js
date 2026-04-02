import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  getProductCategories,
  getProductsByCategory,
  getPublicProducts,
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

/** Predefined categories for dropdowns (no auth). */
router.get("/categories", getProductCategories);

/** Public shop listing: Available, not past 3‑month window; optional ?category= */
router.get("/public", getPublicProducts);

/** Browse by category path, e.g. /category/Mobile%20Phones */
router.get("/category/:category", getProductsByCategory);

/** Seller’s listings; ?sellerId= until auth provides user */
router.get("/my", getMyProducts);

router.post("/", createProduct);

/** Existing: returns all documents (unchanged contract). */
router.get("/", protectRoute, adminRoute, getAllProducts);

router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
