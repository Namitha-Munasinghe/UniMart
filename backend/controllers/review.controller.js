import Groq from "groq-sdk";
import Review from "../model/review.model.js";
import dotenv from "dotenv";

dotenv.config();

// Groq Setup
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const submitReview = async (req, res) => {
    console.log("---- Debug Start ----");
    console.log("Headers:", req.headers['content-type']);
    console.log("Body:", req.body);
    console.log("File:", req.file ? "Image Received" : "No Image");
    console.log("---- Debug End ----");
    
    try {
        // Data ලබා ගැනීම
        const { buyerId, sellerId, rating, comment } = req.body;
        const proofImageURL = req.file ? req.file.path : null;

        // Validation
        if (!buyerId || !sellerId || !rating || !comment) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required." 
            });
        }

        // Groq AI Moderation
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: `Analyze this product review: "${comment}". 
                    Respond ONLY with a JSON object, no extra text: 
                    {"isFlagged": boolean, "sentiment": "positive" or "negative" or "neutral"}. 
                    Set isFlagged to true if it contains hate speech or severe profanity.`
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        // AI Response එක parse කරන්න
        const text = chatCompletion.choices[0]?.message?.content || "";
        const jsonMatch = text.match(/\{.*\}/s);
        const aiAnalysis = JSON.parse(jsonMatch[0]);

        // නරක content block කරන්න
        if (aiAnalysis.isFlagged) {
            return res.status(400).json({ 
                success: false, 
                message: "Review blocked: Inappropriate content detected." 
            });
        }

        // Database එකට Save කරන්න
        const newReview = new Review({ 
            buyerId, 
            sellerId, 
            rating, 
            comment,
            proofImage: proofImageURL,
            sentiment: aiAnalysis.sentiment, 
            isFlagged: aiAnalysis.isFlagged 
        });

        await newReview.save();

        // Success Response
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