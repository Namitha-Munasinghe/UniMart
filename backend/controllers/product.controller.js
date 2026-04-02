import Product, {
  PRODUCT_CATEGORIES,
  getListingCutoffDate,
} from "../model/product.model.js";

export const getProductCategories = async (req, res) => {
  res.json({ categories: PRODUCT_CATEGORIES });
};

/** Marks Available listings older than 90 days as Expired (no cron required). */
export async function expireStaleProducts() {
  const cutoff = getListingCutoffDate();
  await Product.updateMany(
    { status: "Available", createdAt: { $lt: cutoff } },
    { $set: { status: "Expired" } }
  );
}

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    console.log("error in getAllProducts", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * Public shop / homepage: only Available, not expired by date, not Sold/Expired.
 */
export const getPublicProducts = async (req, res) => {
  try {
    await expireStaleProducts();
    const { category } = req.query;
    const cutoff = getListingCutoffDate();

    const filter = {
      status: "Available",
      createdAt: { $gte: cutoff },
    };

    if (category) {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({
          message: "Invalid category",
          categories: PRODUCT_CATEGORIES,
        });
      }
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.log("error in getPublicProducts", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/**
 * Same rules as public list; category comes from URL path (encode spaces as %20).
 */
export const getProductsByCategory = async (req, res) => {
  try {
    await expireStaleProducts();
    const raw = req.params.category;
    const category = raw ? decodeURIComponent(raw) : "";
    if (!PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid or missing category",
        categories: PRODUCT_CATEGORIES,
      });
    }
    const cutoff = getListingCutoffDate();
    const products = await Product.find({
      status: "Available",
      createdAt: { $gte: cutoff },
      category,
    }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.log("error in getProductsByCategory", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    const sellerId = req.query.sellerId;
    if (!sellerId) {
      return res
        .status(400)
        .json({ message: "sellerId query parameter is required" });
    }
    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    console.log("error in getMyProducts", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    await expireStaleProducts();
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ product });
  } catch (error) {
    console.log("error in getProductById", error.message);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product id" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      sellerId,
      status,
      isFeatured,
    } = req.body;

    if (!sellerId) {
      return res.status(400).json({
        message: "sellerId is required until authentication is enabled",
      });
    }

    if (category && !PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid category",
        categories: PRODUCT_CATEGORIES,
      });
    }

    const payload = {
      name,
      description,
      price,
      image,
      category,
      sellerId,
      ...(typeof isFeatured === "boolean" && { isFeatured }),
    };

    if (status) {
      if (!["Available", "Sold"].includes(status)) {
        return res.status(400).json({
          message: "status may only be set to Available or Sold on create",
        });
      }
      payload.status = status;
    }

    const product = await Product.create(payload);
    res.status(201).json({ product });
  } catch (error) {
    console.log("error in createProduct", error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) {
      return res.status(400).json({
        message: "sellerId is required in body to verify ownership",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.sellerId !== sellerId) {
      return res.status(403).json({ message: "Not allowed to update this product" });
    }

    const {
      name,
      description,
      price,
      image,
      category,
      status,
      isFeatured,
    } = req.body;

    if (category !== undefined && !PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Invalid category",
        categories: PRODUCT_CATEGORIES,
      });
    }
    if (status !== undefined && !["Available", "Sold", "Expired"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (price !== undefined) updates.price = price;
    if (image !== undefined) updates.image = image;
    if (category !== undefined) updates.category = category;
    if (status !== undefined) updates.status = status;
    if (typeof isFeatured === "boolean") updates.isFeatured = isFeatured;

    Object.assign(product, updates);
    await product.save();
    res.json({ product });
  } catch (error) {
    console.log("error in updateProduct", error.message);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product id" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const sellerId = req.body.sellerId ?? req.query.sellerId;
    if (!sellerId) {
      return res.status(400).json({
        message: "sellerId is required (body or query) to verify ownership",
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.sellerId !== sellerId) {
      return res.status(403).json({ message: "Not allowed to delete this product" });
    }

    await product.deleteOne();
    res.json({ message: "Product deleted", id: req.params.id });
  } catch (error) {
    console.log("error in deleteProduct", error.message);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product id" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
