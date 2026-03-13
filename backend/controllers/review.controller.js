import leoProfanity from 'leo-profanity';
import natural from 'natural';
import Review from "../model/Review.model.js";

// NLP Configurations
leoProfanity.loadDictionary('en');
const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
const tokenizer = new natural.WordTokenizer();

export const submitReview = async (req, res) => {
    try {
        const { buyerId, sellerId, rating, comment } = req.body;

        // 1. Validation
        if (!buyerId || !sellerId || !rating || !comment) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // 2. Bad Words (Profanity) Check
        if (leoProfanity.check(comment)) {
            return res.status(400).json({ 
                success: false, 
                message: "Review blocked: Inappropriate language detected." 
            });
        }

        // 3. AI Sentiment Analysis
        const tokenizedComment = tokenizer.tokenize(comment);
        const score = analyzer.getSentiment(tokenizedComment);

        // Mongoose Enum එකට ගැලපෙන විදියට simple letters වලින් status එක තීරණය කිරීම
        let sentimentStatus = 'neutral';
        if (score > 0) sentimentStatus = 'positive';
        else if (score < 0) sentimentStatus = 'negative';

        // 4. Database එකට Save කිරීම
        const newReview = new Review({ 
            buyerId, 
            sellerId, 
            rating, 
            comment,
            sentiment: sentimentStatus, 
            isFlagged: score < -2 // ගොඩක් නරක review එකක් නම් auto-flag කිරීම
        });

        await newReview.save();

        res.status(201).json({ 
            success: true, 
            message: `Review submitted as ${sentimentStatus}.`,
            data: newReview 
        });

    } catch (error) {
        console.error("Moderation Error:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};