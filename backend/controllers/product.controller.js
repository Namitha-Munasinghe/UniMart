import mongoose from "mongoose";
import Product, { PRODUCT_CATEGORIES } from "../model/product.model.js";
import User from "../model/user.model.js";

const DUMMY_SELLER_ID = process.env.DUMMY_SELLER_ID || "000000000000000000000001";

const CATEGORY_BASE_PRICES = {
  mobiles: 50000,
  laptops: 120000,
  electronics: 15000,
  accessories: 3500,
  "notes/books": 1500,
  "boarding/rooms": 25000,
  services: 5000,
};

const PRICE_HINTS = [
  { keywords: ["iphone", "macbook", "gaming", "premium"], multiplier: 1.35 },
  { keywords: ["pro", "advanced", "high-end"], multiplier: 1.2 },
  { keywords: ["used", "second hand", "budget"], multiplier: 0.8 },
  { keywords: ["damaged", "repair", "fault"], multiplier: 0.55 },
  { keywords: ["urgent", "quick sale"], multiplier: 0.9 },
];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const resolveSellerId = (req) =>
  req.headers["x-seller-id"] || req.body?.sellerId || req.query?.sellerId || DUMMY_SELLER_ID;

const roundPrice = (value) => Math.max(0, Math.round(value / 100) * 100);
const hasValue = (value) => value !== undefined && value !== null && value !== "";

const syncExpiredProducts = async () => {
  await Product.updateMany(
    {
      status: { $ne: "Expired" },
      expiresAt: { $lte: new Date() },
    },
    {
      $set: { status: "Expired" },
    },
  );
};

const formatProduct = (product) => {
  if (!product) {
    return null;
  }

  const plainProduct = product.toObject ? product.toObject() : product;

  return {
    ...plainProduct,
    seller:
      plainProduct.sellerId && typeof plainProduct.sellerId === "object"
        ? {
            _id: plainProduct.sellerId._id,
            name: plainProduct.sellerId.name,
            email: plainProduct.sellerId.email,
            phone: plainProduct.sellerId.phone,
            faculty: plainProduct.sellerId.faculty,
          }
        : null,
    isExpired: plainProduct.expiresAt <= new Date(),
  };
};

const ensureValidCategory = (category) => PRODUCT_CATEGORIES.includes(category);
const CATEGORY_KEYWORDS = {
  mobiles: ["mobile", "mobiles", "phone", "phones", "smartphone", "iphone", "android"],
  laptops: ["laptop", "laptops", "notebook", "macbook"],
  electronics: ["electronics", "electronic", "monitor", "speaker", "headphone", "gadget", "gadgets"],
  accessories: ["accessory", "accessories", "charger", "case", "bag", "keyboard", "mouse"],
  "notes/books": ["notes", "books", "book", "textbook", "past paper", "lecture note"],
  "boarding/rooms": ["boarding", "room", "rooms", "rent", "rental", "accommodation"],
  services: ["service", "services", "repair", "design", "tutor", "tuition"],
};

const buildPublicQuery = (extraFilters = {}) => ({
  status: "Available",
  expiresAt: { $gt: new Date() },
  ...extraFilters,
});

const assertOwner = (product, sellerId) => {
  const ownerId = product?.sellerId?._id ?? product?.sellerId;
  if (!ownerId || String(ownerId) !== String(sellerId)) {
    return false;
  }

  return true;
};

const inferCategoryFromSearch = async ({ query = "", category }) => {
  if (category && ensureValidCategory(category)) {
    return category;
  }

  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return null;
  }

  const keywordMatch = PRODUCT_CATEGORIES.find((candidate) =>
    CATEGORY_KEYWORDS[candidate]?.some((keyword) => normalizedQuery.includes(keyword)),
  );

  if (keywordMatch) {
    return keywordMatch;
  }

  const regex = new RegExp(normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const matchingProducts = await Product.find(
    buildPublicQuery({
      $or: [{ name: regex }, { description: regex }],
    }),
  )
    .limit(20)
    .select("category");

  if (!matchingProducts.length) {
    return null;
  }

  const categoryCounts = matchingProducts.reduce((accumulator, product) => {
    accumulator[product.category] = (accumulator[product.category] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
};

export const createProduct = async (req, res) => {
  try {
    await syncExpiredProducts();

    const sellerId = resolveSellerId(req);
    const { name, description, price, category } = req.body;
    const images = req.files ? req.files.map((file) => file.path) : [];
    const numericPrice = Number(price);

    if (!isValidObjectId(sellerId)) {
      return res.status(400).json({ success: false, message: "Invalid sellerId." });
    }

    if (!hasValue(name) || !hasValue(description) || !hasValue(price) || !hasValue(category)) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (!images.length) {
      return res.status(400).json({ success: false, message: "At least one image is required." });
    }

    if (images.length > 5) {
      return res.status(400).json({ success: false, message: "You can upload at most 5 images per product." });
    }

    if (!ensureValidCategory(category)) {
      return res.status(400).json({ success: false, message: "Invalid category selected." });
    }

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ success: false, message: "Price must be a valid positive number." });
    }

    const newProduct = await Product.create({
      sellerId,
      name: name.trim(),
      description: description.trim(),
      price: numericPrice,
      images,
      category,
      status: "Available",
    });

    await newProduct.populate("sellerId", "name email phone faculty");

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: formatProduct(newProduct),
    });
  } catch (error) {
    console.error("Create Product Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const getMyProducts = async (req, res) => {
  try {
    await syncExpiredProducts();

    const sellerId = resolveSellerId(req);

    if (!isValidObjectId(sellerId)) {
      return res.status(400).json({ success: false, message: "Invalid sellerId." });
    }

    const products = await Product.find({ sellerId })
      .populate("sellerId", "name email phone faculty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      data: products.map(formatProduct),
    });
  } catch (error) {
    console.error("Get My Products Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    await syncExpiredProducts();

    const sellerId = resolveSellerId(req);
    const { id } = req.params;
    const { name, description, price, category, status } = req.body;
    const uploadedImages = req.files ? req.files.map((file) => file.path) : [];
    const numericPrice = hasValue(price) ? Number(price) : undefined;

    if (!isValidObjectId(sellerId) || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product or seller id." });
    }

    const product = await Product.findById(id).populate("sellerId", "name email phone faculty");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (!assertOwner(product, sellerId)) {
      return res.status(403).json({ success: false, message: "Only the product owner can update this product." });
    }

    if (category && !ensureValidCategory(category)) {
      return res.status(400).json({ success: false, message: "Invalid category selected." });
    }

    if (status && !["Available", "Sold", "Hidden"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status update." });
    }

    if (hasValue(price) && (Number.isNaN(numericPrice) || numericPrice < 0)) {
      return res.status(400).json({ success: false, message: "Price must be a valid positive number." });
    }

    if (name !== undefined) product.name = name.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = numericPrice;
    if (category !== undefined) product.category = category;
    if (status !== undefined) product.status = status;
    if (uploadedImages.length) {
      if (uploadedImages.length > 5) {
        return res.status(400).json({ success: false, message: "You can upload at most 5 images per product." });
      }
      product.images = uploadedImages;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: formatProduct(product),
    });
  } catch (error) {
    console.error("Update Product Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const sellerId = resolveSellerId(req);
    const { id } = req.params;

    if (!isValidObjectId(sellerId) || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product or seller id." });
    }

    const product = await Product.findById(id).populate("sellerId", "name email phone faculty");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (!product.sellerId) {
      return res.status(400).json({ success: false, message: "This product is missing seller information." });
    }

    if (!assertOwner(product, sellerId)) {
      return res.status(403).json({ success: false, message: "Only the product owner can delete this product." });
    }

    await product.deleteOne();

    res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    console.error("Delete Product Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const getAvailableProducts = async (_req, res) => {
  try {
    await syncExpiredProducts();

    const products = await Product.find(buildPublicQuery())
      .populate("sellerId", "name email phone faculty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      data: products.map(formatProduct),
    });
  } catch (error) {
    console.error("Get Available Products Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    await syncExpiredProducts();

    const { category } = req.params;

    if (!ensureValidCategory(category)) {
      return res.status(400).json({ success: false, message: "Invalid category selected." });
    }

    const products = await Product.find(buildPublicQuery({ category }))
      .populate("sellerId", "name email phone faculty")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      data: products.map(formatProduct),
    });
  } catch (error) {
    console.error("Get Products By Category Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const getRecommendedProducts = async (req, res) => {
  try {
    await syncExpiredProducts();

    const interests = Array.isArray(req.user?.interests) ? req.user.interests : [];
    const repeatedSearchCategories = Array.isArray(req.user?.searchCategorySignals)
      ? req.user.searchCategorySignals
          .filter((signal) => signal.count >= 2)
          .sort((a, b) => b.count - a.count || new Date(b.lastSearchedAt) - new Date(a.lastSearchedAt))
          .map((signal) => signal.category)
      : [];
    const recommendationCategories = [...new Set([...interests, ...repeatedSearchCategories])];

    if (recommendationCategories.length === 0) {
      return res.status(200).json({
        success: true,
        totalProducts: 0,
        data: [],
      });
    }

    const products = await Product.find(
      buildPublicQuery({
        category: { $in: recommendationCategories },
        sellerId: { $ne: req.user._id },
      }),
    )
      .populate("sellerId", "name email phone faculty")
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      data: products.map(formatProduct),
    });
  } catch (error) {
    console.error("Get Recommended Products Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const trackSearchSignal = async (req, res) => {
  try {
    await syncExpiredProducts();

    const query = req.body?.query?.trim() || "";
    const category = req.body?.category || null;
    const inferredCategory = await inferCategoryFromSearch({ query, category });

    if (!inferredCategory) {
      return res.status(200).json({ success: true, tracked: false });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const existingSignal = user.searchCategorySignals.find((signal) => signal.category === inferredCategory);

    if (existingSignal) {
      existingSignal.count += 1;
      existingSignal.lastQuery = query;
      existingSignal.lastSearchedAt = new Date();
    } else {
      user.searchCategorySignals.push({
        category: inferredCategory,
        count: 1,
        lastQuery: query,
        lastSearchedAt: new Date(),
      });
    }

    user.searchCategorySignals = user.searchCategorySignals
      .sort((a, b) => b.count - a.count || new Date(b.lastSearchedAt) - new Date(a.lastSearchedAt))
      .slice(0, 10);

    await user.save();

    res.status(200).json({
      success: true,
      tracked: true,
      data: {
        category: inferredCategory,
      },
    });
  } catch (error) {
    console.error("Track Search Signal Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    await syncExpiredProducts();

    const { id } = req.params;
    const sellerId = resolveSellerId(req);

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id." });
    }

    const product = await Product.findById(id).populate("sellerId", "name email phone faculty");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const isOwner = isValidObjectId(sellerId) && assertOwner(product, sellerId);
    const isPubliclyVisible = product.status === "Available" && product.expiresAt > new Date();

    if (!isPubliclyVisible && !isOwner) {
      return res.status(404).json({ success: false, message: "Product not available." });
    }

    res.status(200).json({
      success: true,
      data: formatProduct(product),
    });
  } catch (error) {
    console.error("Get Product By Id Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const suggestProductPrice = async (req, res) => {
  try {
    await syncExpiredProducts();

    const { category, name = "", description = "" } = req.body;

    if (!category || !ensureValidCategory(category)) {
      return res.status(400).json({ success: false, message: "A valid category is required." });
    }

    const similarProducts = await Product.find(buildPublicQuery({ category }))
      .sort({ createdAt: -1 })
      .limit(10)
      .select("price name");

    const combinedText = `${name} ${description}`.toLowerCase();
    const basePrice = CATEGORY_BASE_PRICES[category] || 5000;

    let multiplier = 1;
    const matchedHints = [];

    for (const hint of PRICE_HINTS) {
      const matchedKeyword = hint.keywords.find((keyword) => combinedText.includes(keyword));
      if (matchedKeyword) {
        multiplier *= hint.multiplier;
        matchedHints.push(matchedKeyword);
      }
    }

    const keywordAdjustedBase = basePrice * multiplier;
    const similarAverage =
      similarProducts.length > 0
        ? similarProducts.reduce((sum, product) => sum + product.price, 0) / similarProducts.length
        : null;

    const suggestedPrice = similarAverage
      ? roundPrice((keywordAdjustedBase + similarAverage) / 2)
      : roundPrice(keywordAdjustedBase);

    res.status(200).json({
      success: true,
      data: {
        suggestedPrice,
        currency: "LKR",
        basedOnCategory: category,
        similarProductsCount: similarProducts.length,
        matchedHints,
        reasoning:
          similarProducts.length > 0
            ? "Suggestion combines the category baseline with recent available products in the same category."
            : "Suggestion is based on the category baseline and simple keyword analysis because no similar products were found yet.",
      },
    });
  } catch (error) {
    console.error("Suggest Product Price Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};
