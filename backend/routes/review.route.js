import express from "express";
import { submitReview } from "../controllers/review.controller.js";

const router = express.Router();

// Review එකක් submit කරන්න භාවිතා කරන API එක
router.post("/submit", submitReview);

export default router;