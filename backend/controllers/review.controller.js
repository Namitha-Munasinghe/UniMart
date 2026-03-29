import Groq from "groq-sdk";
import Review from "../model/review.model.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq AI with the API Key from your .env file
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * @desc    Submit a new review, perform AI moderation, and save to DB
 * @route   POST /api/reviews/submit
 */
export const submitReview = async (req, res) => {
    try {
        const { buyerId, sellerId, rating, comment } = req.body;
        
        // Extract Cloudinary URLs from uploaded files (provided by Multer)
        const proofImages = req.files ? req.files.map(f => f.path) : [];

        // Validation: Ensure all required fields are provided
        if (!buyerId || !sellerId || !rating || !comment) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required." 
            });
        }
        
        // AI Moderation: Check for hate speech, profanity, and detect sentiment
        const chatCompletion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `Analyze this product review: "${comment}". 
                Respond ONLY with a JSON object, no extra text: 
                {"isFlagged": boolean, "sentiment": "positive" or "negative" or "neutral"}. 
                Set isFlagged to true if it contains hate speech, severe profanity, or spam.`
            }],
            model: "llama-3.3-70b-versatile",
        });

        // Safe parsing of the AI's JSON response
        const text = chatCompletion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\{.*\}/s);
        const aiAnalysis = JSON.parse(jsonMatch[0]);

        // If the AI flags the content, we block the submission
        if (aiAnalysis.isFlagged) {
            return res.status(400).json({ 
                success: false, 
                message: "Review blocked: Inappropriate content detected." 
            });
        }

        // Create the new review object
        const newReview = new Review({ 
            buyerId, 
            sellerId, 
            rating, 
            comment,
            proofImages: proofImages,
            sentiment: aiAnalysis.sentiment, 
            isFlagged: aiAnalysis.isFlagged,
            adminStatus: 'approved' // Automatically approved for real-time testing
        });

        // Save to MongoDB
        await newReview.save();

        // Send response back to frontend
        res.status(201).json({ 
            success: true, 
            message: `Review submitted! AI sentiment: ${aiAnalysis.sentiment}.`,
            data: newReview 
        });

    } catch (error) {
        console.error("Moderation Error:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error: " + error.message 
        });
    }
};

/**
 * @desc    Get all non-flagged reviews for a specific seller
 * @route   GET /api/reviews/seller/:sellerId
 */
export const getSellerReviews = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const reviews = await Review.find({ 
            sellerId: sellerId,
            isFlagged: false,
        }).populate("buyerId", "name email profileImage");

        // Calculate basic stats for the frontend header
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        res.status(200).json({
            success: true,
            totalReviews,
            averageRating,
            data: reviews
        });

    } catch (error) {
        console.error("Get Reviews Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};

/**
 * @desc    Admin Route: Get all reviews across the platform
 */
export const getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate("buyerId", "name email")
            .populate("sellerId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            totalReviews: reviews.length,
            data: reviews
        });

    } catch (error) {
        console.error("Admin Get Reviews Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};

/**
 * @desc    Admin Route: Manually approve a review
 */
export const approveReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndUpdate(
            id,
            { adminStatus: "approved" },
            { new: true }
        );
        if (!review) return res.status(404).json({ success: false, message: "Review not found." });
        
        res.status(200).json({
            success: true,
            message: "Review approved!",
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

/**
 * @desc    Admin Route: Manually reject a review
 */
export const rejectReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndUpdate(
            id,
            { adminStatus: "rejected" },
            { new: true }
        );
        if (!review) return res.status(404).json({ success: false, message: "Review not found." });
        
        res.status(200).json({
            success: true,
            message: "Review rejected!",
            data: review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
};

/**
 * @desc    AI Task: Generate an English summary and strength tags
 * @route   GET /api/reviews/summary/:sellerId
 */
export const getSellerSummary = async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Fetch only approved reviews for summarization
        const reviews = await Review.find({ sellerId, adminStatus: 'approved' });

        if (reviews.length === 0) {
            return res.status(200).json({ 
                summary: "No reviews available yet to generate an insight.", 
                tags: [] 
            });
        }

        // Combine all approved comments for the AI context
        const allComments = reviews.map(r => r.comment).join(". ");

        // English AI Prompt for Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `Based on these customer reviews: "${allComments}", 
                provide a concise 2-line summary in English 
                and extract the top 3 strengths as short tags in English.
                Respond ONLY with a JSON object: {"summary": "string", "tags": ["tag1", "tag2", "tag3"]}`
            }],
            model: "llama-3.3-70b-versatile",
        });

        // Extract and parse the JSON response
        const text = chatCompletion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\{.*\}/s);
        const aiResponse = JSON.parse(jsonMatch[0]);
        
        res.status(200).json(aiResponse);

    } catch (error) {
        console.error("AI Summary Error:", error);
        res.status(500).json({ message: "Failed to generate summary" });
    }
};

/**
 * @desc    Calculate multi-factor Trust Score for the seller
 * @route   GET /api/reviews/trust-score/:sellerId
 */
export const getSellerTrustScore = async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Fetch all non-flagged reviews
        const reviews = await Review.find({ 
            sellerId: sellerId,
            isFlagged: false 
        });

        const totalReviews = reviews.length;

        if (totalReviews === 0) {
            return res.status(200).json({
                success: true,
                trustScore: 0,
                grade: "No Reviews Yet",
                breakdown: { averageRating: 0, totalReviews: 0, positivePercent: 0, notFlaggedPercent: 100 }
            });
        }

        // Factor 1: Average Rating Score (Weighted 40%)
        const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;
        const ratingScore = (averageRating / 5) * 40;

        // Factor 2: Review Volume Score (Weighted 20%) - Max 50 reviews
        const reviewScore = Math.min(totalReviews / 50, 1) * 20;

        // Factor 3: Positive Sentiment Ratio (Weighted 25%)
        const positiveCount = reviews.filter(r => r.sentiment === "positive").length;
        const positivePercent = (positiveCount / totalReviews) * 100;
        const positiveScore = (positivePercent / 100) * 25;

        // Factor 4: Content Integrity Score (Weighted 15%)
        const allReviewsTotal = await Review.find({ sellerId });
        const notFlaggedPercent = (totalReviews / allReviewsTotal.length) * 100;
        const flagScore = (notFlaggedPercent / 100) * 15;

        // Final Aggregate Score calculation
        const trustScore = Math.round(ratingScore + reviewScore + positiveScore + flagScore);

        // Determine Human-readable Grade
        let grade = "Needs Improvement ⚠️";
        if (trustScore >= 80) grade = "Excellent ⭐";
        else if (trustScore >= 60) grade = "Good 👍";
        else if (trustScore >= 40) grade = "Average 😐";

        res.status(200).json({
            success: true,
            trustScore,
            grade,
            breakdown: {
                averageRating: averageRating.toFixed(1),
                totalReviews,
                positivePercent: Math.round(positivePercent),
                notFlaggedPercent: Math.round(notFlaggedPercent)
            }
        });

    } catch (error) {
        console.error("Trust Score Logic Error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};