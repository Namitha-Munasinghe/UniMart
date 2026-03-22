import mongoose from "mongoose";

/** Predefined shop categories (use exact strings in API & clients). */
export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Mobile Phones",
  "Laptops",
  "Accessories",
  "Notes & Books",
  "Boarding / Rooms",
  "Services",
];

export const PRODUCT_STATUSES = ["Available", "Sold", "Expired"];

const THREE_MONTHS_MS = 1000 * 60 * 60 * 24 * 90;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    image: {
      type: String,
      required: [true, "image is required"],
    },
    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
    },
    status: {
      type: String,
      enum: PRODUCT_STATUSES,
      default: "Available",
    },
    /** Set on create; used for ownership until auth wires req.user */
    sellerId: {
      type: String,
      required: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, status: 1 });
productSchema.index({ createdAt: 1 });

export function getListingCutoffDate() {
  return new Date(Date.now() - THREE_MONTHS_MS);
}

const Product = mongoose.model("Product", productSchema);

export default Product;
