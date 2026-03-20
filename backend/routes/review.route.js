import express from "express";
import { submitReview, getSellerReviews } from "../controllers/review.controller.js";
import upload from "../lib/cloudinary.js";

const router = express.Router();

// Review Submit කරන්න
router.post('/submit', upload.single('proofImage'), submitReview);

// Seller ගේ Reviews ගන්න
router.get('/seller/:sellerId', getSellerReviews);

export default router;