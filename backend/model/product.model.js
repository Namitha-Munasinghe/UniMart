import mongoose from "mongoose";

export const PRODUCT_CATEGORIES = [
  "mobiles",
  "laptops",
  "electronics",
  "accessories",
  "notes/books",
  "boarding/rooms",
  "services",
];

export const PRODUCT_STATUSES = ["Available", "Sold", "Hidden", "Expired"];

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: 3000,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be zero or greater"],
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: [true, "Product category is required"],
      index: true,
    },
    status: {
      type: String,
      enum: PRODUCT_STATUSES,
      default: "Available",
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 3);
        return expiresAt;
      },
      index: true,
    },
  },
  { timestamps: true },
);

productSchema.index({ status: 1, category: 1, createdAt: -1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
