import express from "express";
import {
  createProduct,
  deleteProduct,
  getAvailableProducts,
  getMyProducts,
  getProductById,
  getProductsByCategory,
  suggestProductPrice,
  updateProduct,
} from "../controllers/product.controller.js";
import { createCloudinaryUpload } from "../lib/cloudinary.js";

const router = express.Router();
const productUpload = createCloudinaryUpload("UniMart_Products");

router.get("/available", getAvailableProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/my-products", getMyProducts);
router.post("/suggest-price", suggestProductPrice);
router.post("/", productUpload.array("images", 5), createProduct);
router.get("/:id", getProductById);
router.put("/:id", productUpload.array("images", 5), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
