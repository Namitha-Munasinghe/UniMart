import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    buyerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sellerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    comment: { 
        type: String, 
        required: true 
    },
    
    // ✅ Multiple Images - Array of Cloudinary URLs
    proofImages: { 
        type: [String], 
        default: [] 
    },
    
    // AI Moderation
    sentiment: { 
        type: String, 
        enum: ['positive', 'neutral', 'negative'], 
        default: 'neutral' 
    },
    isFlagged: { 
        type: Boolean, 
        default: false 
    },
    
    // Admin Control
    adminStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;