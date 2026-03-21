import express from "express";
import { submitReview } from "../controllers/review.controller.js";
import upload from '../lib/cloudinary.js';

const router = express.Router();


router.post('/submit', upload.single('proofImage'), submitReview);

export default router;