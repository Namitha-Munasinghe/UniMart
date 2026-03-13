import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    sentiment: { 
        type: String, 
        enum: ['positive', 'neutral', 'negative'], // Simple letters වලින්ම තියෙන්න ඕනේ
        default: 'neutral' 
    },
    isFlagged: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;