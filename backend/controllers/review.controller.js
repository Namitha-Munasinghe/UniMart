import leoProfanity from 'leo-profanity';
import Review from "../model/Review.model.js";

leoProfanity.loadDictionary('en');

/**
 * @desc    Submit a review using Local NLP Moderation
 */
export const submitReview = async (req, res) => {
    try {
        const { buyerId, sellerId, rating, comment } = req.body;

        if (!buyerId || !sellerId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // 1. NLP Moderation Check
        if (leoProfanity.check(comment)) {
            return res.status(400).json({ 
                success: false, 
                message: "Review blocked by AI/NLP: Inappropriate language detected." 
            });
        }

        // 2. Database එකට Save කිරීම
        const newReview = new Review({ buyerId, sellerId, rating, comment });
        await newReview.save();

        res.status(201).json({ 
            success: true, 
            message: "Review submitted successfully.",
            data: newReview 
        });

    } catch (error) {
        console.error("Moderation Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};