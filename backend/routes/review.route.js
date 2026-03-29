import express from "express";
import { 
    submitReview, 
    getSellerReviews,
    getAllReviewsAdmin,
    approveReview,
    rejectReview,
    getSellerTrustScore,
    getSellerSummary // 👈 මේක අනිවාර්යයෙන්ම මෙතනට එකතු කරන්න!
} from "../controllers/review.controller.js";
import upload from "../lib/cloudinary.js";

const router = express.Router();

// Review Submit කරන්න
router.post('/submit', upload.array('proofImages', 5), submitReview);

// Seller ගේ Reviews ගන්නවා
router.get('/seller/:sellerId', getSellerReviews);

// Trust Score ගන්නවා
router.get('/trust-score/:sellerId', getSellerTrustScore);

// AI Summary & Tags ගන්නවා
router.get("/summary/:sellerId", getSellerSummary); // ✅ දැන් මේක වැඩ කරනවා

// Admin Routes
router.get('/admin/all', getAllReviewsAdmin);
router.patch('/admin/:id/approve', approveReview);
router.patch('/admin/:id/reject', rejectReview);

export default router;