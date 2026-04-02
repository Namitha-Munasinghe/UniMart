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

function pickPercentile(sorted, percentile) {
  if (!sorted.length) return null;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((sorted.length - 1) * percentile))
  );
  return sorted[idx];
}

/**
 * Smart price suggestion (non-AI):
 * Uses existing products in the same category (and optional keyword matches)
 * to suggest min/max/target prices.
 */
export const suggestProductPrice = async (req, res) => {
  try {
    const { name = "", description = "", category } = req.body ?? {};

    if (!category || !PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        message: "Valid category is required for price suggestion",
        categories: PRODUCT_CATEGORIES,
      });
    }

    await expireStaleProducts();

    const tokenSource = `${name} ${description}`.toLowerCase();
    const tokens = Array.from(
      new Set(
        tokenSource
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length >= 3)
          .slice(0, 8)
      )
    );

    const cutoff = getListingCutoffDate();
    const baseFilter = {
      category,
      createdAt: { $gte: cutoff },
      status: { $in: ["Available", "Sold"] },
    };

    const tokenFilter = tokens.length
      ? {
          $or: tokens.map((token) => ({
            $or: [
              { name: { $regex: token, $options: "i" } },
              { description: { $regex: token, $options: "i" } },
            ],
          })),
        }
      : null;

    const filter = tokenFilter ? { ...baseFilter, ...tokenFilter } : baseFilter;

    // Pull recent market data (prices) for this category.
    let matches = await Product.find(filter).sort({ createdAt: -1 }).limit(35);

    // Fallback: category only (no token matching).
    if (!matches.length) {
      matches = await Product.find(baseFilter).sort({ createdAt: -1 }).limit(35);
    }

    if (!matches.length) {
      return res.status(404).json({
        message: "Not enough market data for this category yet",
        suggestion: null,
      });
    }

    const prices = matches
      .map((p) => Number(p.price))
      .filter((p) => Number.isFinite(p) && p >= 0)
      .sort((a, b) => a - b);

    if (!prices.length) {
      return res.status(404).json({
        message: "Not enough valid prices found for this category",
        suggestion: null,
      });
    }

    const q1 = pickPercentile(prices, 0.25);
    const q2 = pickPercentile(prices, 0.5);
    const q3 = pickPercentile(prices, 0.75);

    const step = 50;
    const roundToStep = (v) => Math.max(0, Math.round(v / step) * step);

    const suggestedMin = roundToStep(q1 * 0.95);
    const suggestedMax = Math.max(suggestedMin, roundToStep(q3 * 1.05));
    const suggestedTarget = roundToStep(q2);

    const confidence =
      matches.length >= 15 ? "High" : matches.length >= 8 ? "Medium" : "Low";

    res.json({
      suggestion: {
        min: suggestedMin,
        max: suggestedMax,
        target: suggestedTarget,
        confidence,
        sampleSize: matches.length,
      },
      comparables: matches.slice(0, 5).map((p) => ({
        id: p._id,
        name: p.name,
        price: p.price,
        status: p.status,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.log("error in suggestProductPrice", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

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
      category,
      sellerId,
      status,
      isFeatured,
    } = req.body;

    const uploadedImage = req.file
      ? `/uploads/products/${req.file.filename}`
      : undefined;

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

    if (!uploadedImage) {
      return res.status(400).json({
        message: "Product image file is required",
      });
    }

    const payload = {
      name,
      description,
      price,
      image: uploadedImage,
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
      image: imageFromBody,
      category,
      status,
      isFeatured,
    } = req.body;

    const imageFromFile = req.file
      ? `/uploads/products/${req.file.filename}`
      : undefined;
    const finalImage = imageFromFile ?? imageFromBody;

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
    if (finalImage !== undefined) updates.image = finalImage;
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
    // `DELETE` calls from the frontend don't send a JSON body,
    // so `req.body` can be undefined.
    const sellerId = req.body?.sellerId ?? req.query.sellerId;
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
