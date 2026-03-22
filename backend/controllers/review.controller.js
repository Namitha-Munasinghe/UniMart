import Groq from "groq-sdk";//import Groq AI library 
import Review from "../model/review.model.js";
import dotenv from "dotenv";

dotenv.config();

// initialize with API key
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const submitReview = async (req, res) => {
    try {
        const { buyerId, sellerId, rating, comment } = req.body;
        const proofImages = req.files ? req.files.map(f => f.path) : [];// Extract Cloudinary URLs from uploaded files as an array

        if (!buyerId || !sellerId || !rating || !comment) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required." 
            });
        }
        
        //send review comment to Groq AI for moderation and sentiment analysis
        const chatCompletion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `Analyze this product review: "${comment}". 
                Respond ONLY with a JSON object, no extra text: 
                {"isFlagged": boolean, "sentiment": "positive" or "negative" or "neutral"}. 
                Set isFlagged to true if it contains hate speech or severe profanity.`
            }],
            model: "llama-3.3-70b-versatile",
        });

        const text = chatCompletion.choices[0]?.message?.content || "";// Extract JSON from AI response
        const jsonMatch = text.match(/\{.*\}/s);// Use regex to find JSON object in the response
        const aiAnalysis = JSON.parse(jsonMatch[0]);// Parse the JSON string into an object

        // If AI flags the review, block it and return an error response
        if (aiAnalysis.isFlagged) {
            return res.status(400).json({ 
                success: false, 
                message: "Review blocked: Inappropriate content detected." 
            });
        }

        const newReview = new Review({ 
            buyerId, 
            sellerId, 
            rating, 
            comment,
            proofImages: proofImages,
            sentiment: aiAnalysis.sentiment, 
            isFlagged: aiAnalysis.isFlagged 
        });

        await newReview.save();

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

export const getSellerReviews = async (req, res) => {
    try {
        const { sellerId } = req.params;

        const reviews = await Review.find({ 
            sellerId: sellerId,
            isFlagged: false,
        }).populate("buyerId", "name email profileImage");

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

export const approveReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndUpdate(
            id,
            { adminStatus: "approved" },
            { new: true }
        );
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }
        res.status(200).json({
            success: true,
            message: "Review approved!",
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};

export const rejectReview = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await Review.findByIdAndUpdate(
            id,
            { adminStatus: "rejected" },
            { new: true }
        );
        if (!review) {
            return res.status(404).json({
                success: false,
                message: "Review not found."
            });
        }
        res.status(200).json({
            success: true,
            message: "Review rejected!",
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error: " + error.message
        });
    }
};