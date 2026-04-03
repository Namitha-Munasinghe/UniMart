import mongoose from "mongoose";

export const MEETING_STATUSES = ["Pending", "Confirmed", "Ignored", "Cancelled"];

const meetingMessageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const meetingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      enum: [15, 30, 45, 60],
      default: 30,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: MEETING_STATUSES,
      default: "Pending",
      index: true,
    },
    messages: {
      type: [meetingMessageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

meetingSchema.index({ sellerId: 1, scheduledAt: 1 });
meetingSchema.index({ buyerId: 1, scheduledAt: 1 });

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
