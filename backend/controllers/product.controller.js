import mongoose from "mongoose";
import Groq from "groq-sdk";
import Product, { PRODUCT_CATEGORIES } from "../model/product.model.js";
import User from "../model/user.model.js";
import Review from "../model/review.model.js";
import { mapUploadedImageUrls } from "../lib/cloudinary.js";

const PRODUCT_UPLOAD_FOLDER = "UniMart_Products";

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
  req.headers["x-seller-id"] || req.body.sellerId || req.query.sellerId || DUMMY_SELLER_ID;

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

const formatProduct = (product) => ({
  ...product.toObject(),
  isExpired: product.expiresAt <= new Date(),
});

const ensureValidCategory = (category) => PRODUCT_CATEGORIES.includes(category);

const buildPublicQuery = (extraFilters = {}) => ({
  status: "Available",
  expiresAt: { $gt: new Date() },
  ...extraFilters,
});

const assertOwner = (product, sellerId) => {
  if (product.sellerId.toString() !== sellerId) {
    return false;
  }

  return true;
};

export const createProduct = async (req, res) => {
  try {
    await syncExpiredProducts();

    const sellerId = resolveSellerId(req);
    const { name, description, price, category } = req.body;
    const images = mapUploadedImageUrls(req.files, PRODUCT_UPLOAD_FOLDER);
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
      return res.status(400).json({ success: false, message: "Maximum 5 images allowed." });
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

    const products = await Product.find({ sellerId }).sort({ createdAt: -1 });

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
    const { name, description, price, category, status, keptImageUrls: keptRaw } = req.body;
    const uploadedImages = mapUploadedImageUrls(req.files, PRODUCT_UPLOAD_FOLDER);
    const numericPrice = hasValue(price) ? Number(price) : undefined;

    let keptUrls = [];
    try {
      const parsed = typeof keptRaw === "string" ? JSON.parse(keptRaw) : keptRaw;
      if (Array.isArray(parsed)) keptUrls = parsed.filter((u) => typeof u === "string");
    } catch {
      keptUrls = [];
    }

    if (!isValidObjectId(sellerId) || !isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product or seller id." });
    }

    const product = await Product.findById(id);

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

    const mergedImages = [...keptUrls, ...uploadedImages].slice(0, 5);
    if (keptUrls.length || uploadedImages.length) {
      if (mergedImages.length < 1) {
        return res.status(400).json({ success: false, message: "At least one image is required." });
      }
      product.images = mergedImages;
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

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
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

    const products = await Product.find(buildPublicQuery()).sort({ createdAt: -1 });

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

const SORT_OPTIONS = new Set(["new", "price_low", "price_high", "name_az", "name_za"]);

export const listProductCategories = async (_req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: PRODUCT_CATEGORIES,
    });
  } catch (error) {
    console.error("List Product Categories Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const browseProducts = async (req, res) => {
  try {
    await syncExpiredProducts();

    const { category, q, minPrice, maxPrice, sort: sortRaw } = req.query;
    const sort = SORT_OPTIONS.has(sortRaw) ? sortRaw : "new";

    const filter = buildPublicQuery();

    if (category && category !== "all") {
      if (!ensureValidCategory(category)) {
        return res.status(400).json({ success: false, message: "Invalid category." });
      }
      filter.category = category;
    }

    const term = typeof q === "string" ? q.trim() : "";
    if (term) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
      ];
    }

    let lo = minPrice !== undefined && minPrice !== "" ? Number(minPrice) : NaN;
    let hi = maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : NaN;
    if (!Number.isNaN(lo) && !Number.isNaN(hi) && lo > hi) {
      [lo, hi] = [hi, lo];
    }

    const priceCond = {};
    if (!Number.isNaN(lo) && lo >= 0) priceCond.$gte = lo;
    if (!Number.isNaN(hi) && hi >= 0) priceCond.$lte = hi;
    if (Object.keys(priceCond).length) filter.price = priceCond;

    let sortOption = { createdAt: -1 };
    if (sort === "price_low") sortOption = { price: 1 };
    else if (sort === "price_high") sortOption = { price: -1 };
    else if (sort === "name_az") sortOption = { name: 1 };
    else if (sort === "name_za") sortOption = { name: -1 };

    const products = await Product.find(filter).sort(sortOption);

    res.status(200).json({
      success: true,
      totalProducts: products.length,
      data: products.map(formatProduct),
    });
  } catch (error) {
    console.error("Browse Products Error:", error.message);
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

    const products = await Product.find(buildPublicQuery({ category })).sort({ createdAt: -1 });

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

export const getProductById = async (req, res) => {
  try {
    await syncExpiredProducts();

    const { id } = req.params;
    const sellerId = resolveSellerId(req);

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid product id." });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    const isOwner = isValidObjectId(sellerId) && assertOwner(product, sellerId);
    const isPubliclyVisible = product.status === "Available" && product.expiresAt > new Date();

    if (!isPubliclyVisible && !isOwner) {
      return res.status(404).json({ success: false, message: "Product not available." });
    }

    const sellerDoc = await User.findById(product.sellerId).select("name studentId faculty email");
    const approvedReviews = await Review.find({
      sellerId: product.sellerId,
      isFlagged: false,
      adminStatus: "approved",
    }).select("rating");

    let sellerTrustLine = "No approved reviews for this seller yet.";
    if (approvedReviews.length > 0) {
      const avg =
        approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
      if (avg >= 4.2) {
        sellerTrustLine = "Verified trusted seller — strong buyer ratings.";
      } else if (avg >= 3.5) {
        sellerTrustLine = "Reliable seller with positive buyer feedback.";
      } else {
        sellerTrustLine = "Check reviews — mixed feedback from buyers.";
      }
    }

    const base = formatProduct(product);
    res.status(200).json({
      success: true,
      data: {
        ...base,
        isOwner,
        seller: sellerDoc
          ? {
              name: sellerDoc.name,
              studentId: sellerDoc.studentId,
              faculty: sellerDoc.faculty,
            }
          : null,
        sellerTrustLine,
      },
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

    let suggestedPrice = similarAverage
      ? roundPrice((keywordAdjustedBase + similarAverage) / 2)
      : roundPrice(keywordAdjustedBase);

    let reasoning =
      similarProducts.length > 0
        ? "Blended category baseline with recent listings in UniMart."
        : "Based on category baseline; few similar listings in UniMart yet.";

    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const groq = new Groq({ apiKey: groqKey });
        const aiRes = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `You price used items on a Sri Lankan university student marketplace (LKR).
Product name: "${name}"
Category: ${category}
Description: "${description}"
Return ONLY valid JSON: {"priceLkr": <integer>, "why": "<English, 5-10 words: practical basis for used/campus price>"}
Use realistic second-hand LKR. No markdown or extra text.`,
            },
          ],
          temperature: 0.3,
        });
        const text = aiRes.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const aiPrice = Number(parsed.priceLkr);
          const why = typeof parsed.why === "string" ? parsed.why.trim() : "";
          if (!Number.isNaN(aiPrice) && aiPrice >= 0) {
            const blended = similarAverage
              ? roundPrice((aiPrice + similarAverage + keywordAdjustedBase) / 3)
              : roundPrice((aiPrice + keywordAdjustedBase) / 2);
            suggestedPrice = blended;
            reasoning = why || reasoning;
          }
        }
      } catch (aiErr) {
        console.error("AI price suggestion:", aiErr.message);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        suggestedPrice,
        currency: "LKR",
        basedOnCategory: category,
        similarProductsCount: similarProducts.length,
        matchedHints,
        reasoning,
      },
    });
  } catch (error) {
    console.error("Suggest Product Price Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};
