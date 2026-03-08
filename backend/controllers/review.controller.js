import { GoogleGenerativeAI } from "@google/generative-ai";
import Review from "../model/review.model.js";
import User from "../model/user.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const updateSellerTrustScore = async (sellerId) => {
    const reviews = await Review.find({ sellerId });
    if (reviews.length === 0) return;

    const avgRating = reviews.reduce((acc, r) => r.rating + acc, 0) / reviews.length;
    const positiveCount = reviews.filter(r => r.sentiment === 'Positive').length;
    const sentimentScore = (positiveCount / reviews.length) * 5; 

    const score = ((avgRating * 0.6) + (sentimentScore * 0.4)) * 20;
    await User.findByIdAndUpdate(sellerId, { trustScore: score.toFixed(2) });
};

export const submitReview = async (req, res) => {
    const { comment, rating, sellerId, buyerId } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const prompt = `Analyze: "${comment}". JSON ONLY: {"isFlagged": false, "sentiment": "Positive"}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim().replace(/```json|```/g, "");
        const aiAnalysis = JSON.parse(text);

        const newReview = new Review({ 
            buyerId, sellerId, rating, comment, 
            sentiment: aiAnalysis.sentiment || "Neutral" 
        });

        if (aiAnalysis.isFlagged) {
            return res.status(400).json({ success: false, message: "Inappropriate content." });
        }

        await newReview.save();
        await updateSellerTrustScore(sellerId);
        res.status(201).json({ success: true, message: "Review submitted!" });

    } catch (error) {
        console.error("AI SYSTEM ERROR:", error);
        // AI වැඩ නොකළොත් Database එකට විතරක් save කරන backup එක:
        const fallbackReview = new Review({ buyerId, sellerId, rating, comment, sentiment: "Neutral" });
        await fallbackReview.save();
        await updateSellerTrustScore(sellerId);
        res.status(201).json({ success: true, message: "Review submitted (Fallback Mode)." });
    }
};