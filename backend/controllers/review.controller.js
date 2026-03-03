import { OpenAI } from "openai";
import Review from "../models/review.model.js"; // Ensure you have created this model

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
});

export const submitReview = async (req, res) => {
  try {
    const { comment, rating, sellerId, buyerId } = req.body;

    // STEP 1: AI CONTENT MODERATION
    const moderation = await openai.moderations.create({ input: comment });
    const isFlagged = moderation.results[0].flagged;

    if (isFlagged) {
      return res.status(400).json({ 
        success: false,
        message: "Review rejected: Inappropriate content detected by AI." 
      });
    }

    // STEP 2: AI SENTIMENT ANALYSIS
    // We ask AI to categorize the review mood to help calculate the Trust Score
    const sentimentResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Categorize the sentiment of this review as 'Positive', 'Neutral', or 'Negative'. Reply with only one word." },
        { role: "user", content: comment }
      ],
    });

    const sentiment = sentimentResponse.choices[0].message.content.trim();

    // STEP 3: SAVE TO MONGODB
    const newReview = new Review({
      buyerId,
      sellerId,
      rating,
      comment,
      sentiment, // Saved for Trust Score calculation
      isFlagged: false
    });

    await newReview.save();

    res.status(201).json({ 
      success: true, 
      message: "Review submitted successfully!", 
      sentiment: sentiment 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};