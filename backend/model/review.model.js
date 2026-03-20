import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    
    // අලුතින් එකතු කළ කොටස: Photo Upload එක සඳහා
    proofImage: { type: String, default: null }, // Cloudinary වලින් එන URL එක මෙතන සේව් වෙනවා
    
    // AI Moderation සඳහා
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    isFlagged: { type: Boolean, default: false }, // AI එකෙන් නරක වචන තිබ්බොත් Flag කරනවා
    
    // Admin Control සඳහා
    adminStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    
    createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;