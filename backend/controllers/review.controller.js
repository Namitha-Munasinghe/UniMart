import { OpenAI } from "openai";
import Review from "../models/review.model.js";
import User from "../models/user.model.js"; // Seller ගේ ලකුණු update කරන්න මේක ඕනේ

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Trust Score එක ගණනය කරන Logic එක
const updateSellerTrustScore = async (sellerId) => {
    const reviews = await Review.find({ sellerId });
    if (reviews.length === 0) return;

    // 1. Average Rating (60% බරක්)
    const avgRating = reviews.reduce((acc, r) => r.rating + acc, 0) / reviews.length;

    // 2. Positive Sentiment % (40% බරක්)
    const positiveCount = reviews.filter(r => r.sentiment === 'Positive').length;
    const sentimentScore = (positiveCount / reviews.length) * 5; 

    // 3. Final Score Calculation (0-100% අතරට)
    const score = ((avgRating * 0.6) + (sentimentScore * 0.4)) * 20;

    await User.findByIdAndUpdate(sellerId, { trustScore: score.toFixed(2) });
};

export const submitReview = async (req, res) => {
    try {
        const { comment, rating, sellerId, buyerId } = req.body;

        // AI Moderation
        const moderation = await openai.moderations.create({ input: comment });
        if (moderation.results[0].flagged) {
            return res.status(400).json({ message: "Inappropriate content detected." });
        }

        // AI Sentiment Analysis
        const aiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: "Categorize as 'Positive', 'Neutral', or 'Negative'. One word only." }, { role: "user", content: comment }]
        });
        const sentiment = aiResponse.choices[0].message.content.trim();

        // Save Review
        const newReview = new Review({ buyerId, sellerId, rating, comment, sentiment });
        await newReview.save();

        // Update Trust Score!
        await updateSellerTrustScore(sellerId);

        res.status(201).json({ success: true, message: "Review added and Trust Score updated!" });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};