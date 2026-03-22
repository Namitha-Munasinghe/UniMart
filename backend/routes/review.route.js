import express from "express";
import { 
    submitReview, 
    getSellerReviews,
    getAllReviewsAdmin,
    approveReview,
    rejectReview
} from "../controllers/review.controller.js";
import upload from "../lib/cloudinary.js";

const router = express.Router();

// ✅ array() - max 5 images
router.post('/submit', upload.array('proofImages', 5), submitReview);

router.get('/seller/:sellerId', getSellerReviews);
router.get('/admin/all', getAllReviewsAdmin);
router.patch('/admin/:id/approve', approveReview);
router.patch('/admin/:id/reject', rejectReview);

export default router;