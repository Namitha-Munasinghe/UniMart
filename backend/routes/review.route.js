import express from "express";
import { 
    submitReview, 
    getSellerReviews,
    getAllReviewsAdmin,
    approveReview,
    rejectReview,
    getSellerTrustScore,
    getSellerSummary,
    generateAIReply,    
    submitSellerReply   
} from "../controllers/review.controller.js";
import upload from "../lib/cloudinary.js";

const router = express.Router();

// --- Buyer Routes ---
// Review Submit කරන්න
router.post('/submit', upload.array('proofImages', 5), submitReview);

// --- Seller Routes ---
// Seller ගේ Reviews ගන්නවා
router.get('/seller/:sellerId', getSellerReviews);

// Trust Score ගන්නවා
router.get('/trust-score/:sellerId', getSellerTrustScore);

// AI Summary & Tags ගන්නවා
router.get("/summary/:sellerId", getSellerSummary);

// AI එකෙන් Reply එකක් Suggest කරගන්න (අලුත් ✨)
router.post("/suggest-reply", generateAIReply); 

// සෙලර්ගේ Reply එක Save කරන්න (අලුත් ✨)
router.put("/reply/:id", submitSellerReply); 

// --- Admin Routes ---
router.get('/admin/all', getAllReviewsAdmin);
router.patch('/admin/:id/approve', approveReview);
router.patch('/admin/:id/reject', rejectReview);

export default router;