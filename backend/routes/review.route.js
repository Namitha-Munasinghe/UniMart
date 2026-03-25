import express from "express";
import { 
    submitReview, 
    getSellerReviews,
    getAllReviewsAdmin,
    approveReview,
    rejectReview,
    getSellerTrustScore
} from "../controllers/review.controller.js";
import upload from "../lib/cloudinary.js";

const router = express.Router();

// Review Submit කරන්න
router.post('/submit', upload.array('proofImages', 5), submitReview);

// Seller ගේ Reviews ගන්නවා
router.get('/seller/:sellerId', getSellerReviews);

// Trust Score ගන්නවා
router.get('/trust-score/:sellerId', getSellerTrustScore);

// Admin Routes
router.get('/admin/all', getAllReviewsAdmin);
router.patch('/admin/:id/approve', approveReview);
router.patch('/admin/:id/reject', rejectReview);

export default router;