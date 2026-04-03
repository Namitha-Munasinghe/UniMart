import mongoose from "mongoose";
import Meeting, { MEETING_STATUSES } from "../model/meeting.model.js";
import Product from "../model/product.model.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatMeeting = (meeting) => {
  const plainMeeting = meeting.toObject ? meeting.toObject() : meeting;
  const buyerId = plainMeeting.buyerId?._id?.toString?.() || plainMeeting.buyerId?.toString?.() || "";
  const sellerId = plainMeeting.sellerId?._id?.toString?.() || plainMeeting.sellerId?.toString?.() || "";

  return {
    ...plainMeeting,
    buyer: plainMeeting.buyerId
      ? {
          _id: plainMeeting.buyerId._id,
          name: plainMeeting.buyerId.name,
          email: plainMeeting.buyerId.email,
          phone: plainMeeting.buyerId.phone,
          faculty: plainMeeting.buyerId.faculty,
        }
      : null,
    seller: plainMeeting.sellerId
      ? {
          _id: plainMeeting.sellerId._id,
          name: plainMeeting.sellerId.name,
          email: plainMeeting.sellerId.email,
          phone: plainMeeting.sellerId.phone,
          faculty: plainMeeting.sellerId.faculty,
        }
      : null,
    product: plainMeeting.productId
      ? {
          _id: plainMeeting.productId._id,
          name: plainMeeting.productId.name,
          price: plainMeeting.productId.price,
          images: plainMeeting.productId.images,
          category: plainMeeting.productId.category,
          status: plainMeeting.productId.status,
        }
      : null,
    messages: (plainMeeting.messages || []).map((message) => {
      const senderId = message.senderId?._id?.toString?.() || message.senderId?.toString?.() || "";
      const senderRole = senderId === buyerId ? "buyer" : senderId === sellerId ? "seller" : "unknown";

      return {
        _id: message._id,
        text: message.text,
        createdAt: message.createdAt,
        senderId,
        senderRole,
      };
    }),
  };
};

const populateMeetingQuery = (query) =>
  query
    .populate("buyerId", "name email phone faculty")
    .populate("sellerId", "name email phone faculty")
    .populate("productId", "name price images category status");

export const createMeeting = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { productId, scheduledAt, durationMinutes, location, note = "" } = req.body;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product selected." });
    }

    if (!scheduledAt || !location || !durationMinutes) {
      return res.status(400).json({ success: false, message: "Date, time, duration, and location are required." });
    }

    const scheduledDate = new Date(scheduledAt);
    const duration = Number(durationMinutes);

    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return res.status(400).json({ success: false, message: "Please select a future date and time." });
    }

    if (![15, 30, 45, 60].includes(duration)) {
      return res.status(400).json({ success: false, message: "Invalid duration selected." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (!product.sellerId) {
      return res.status(400).json({ success: false, message: "This product is missing seller information." });
    }

    if (product.status !== "Available" || product.expiresAt <= new Date()) {
      return res.status(400).json({ success: false, message: "This product is no longer available for meetings." });
    }

    if (product.sellerId.toString() === buyerId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot schedule a meeting for your own product." });
    }

    const existingActiveMeeting = await Meeting.findOne({
      productId,
      buyerId,
      status: { $in: ["Pending", "Confirmed"] },
    });

    if (existingActiveMeeting) {
      return res.status(400).json({
        success: false,
        message: "You already have an active meeting request for this product.",
      });
    }

    const meeting = await Meeting.create({
      productId,
      buyerId,
      sellerId: product.sellerId,
      scheduledAt: scheduledDate,
      durationMinutes: duration,
      location: location.trim(),
      note: note.trim(),
      status: "Pending",
    });

    const savedMeeting = await populateMeetingQuery(Meeting.findById(meeting._id));

    res.status(201).json({
      success: true,
      message: "Meeting request sent to the seller.",
      data: formatMeeting(savedMeeting),
    });
  } catch (error) {
    console.error("Create Meeting Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const getBuyerMeetings = async (req, res) => {
  try {
    const meetings = await populateMeetingQuery(
      Meeting.find({ buyerId: req.user._id }).sort({ scheduledAt: 1, createdAt: -1 }),
    );

    res.status(200).json({
      success: true,
      data: meetings.map(formatMeeting),
    });
  } catch (error) {
    console.error("Get Buyer Meetings Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const getSellerMeetings = async (req, res) => {
  try {
    const meetings = await populateMeetingQuery(
      Meeting.find({ sellerId: req.user._id }).sort({ createdAt: -1, scheduledAt: 1 }),
    );

    res.status(200).json({
      success: true,
      data: meetings.map(formatMeeting),
    });
  } catch (error) {
    console.error("Get Seller Meetings Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid meeting selected." });
    }

    if (!MEETING_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid meeting status." });
    }

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    const currentUserId = req.user._id.toString();
    const isSeller = meeting.sellerId.toString() === currentUserId;
    const isBuyer = meeting.buyerId.toString() === currentUserId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({ success: false, message: "You cannot update this meeting." });
    }

    if (isSeller && !["Confirmed", "Ignored"].includes(status)) {
      return res.status(400).json({ success: false, message: "Sellers can only confirm or ignore requests." });
    }

    if (isBuyer && status !== "Cancelled") {
      return res.status(400).json({ success: false, message: "Buyers can only cancel their own meetings." });
    }

    meeting.status = status;
    await meeting.save();

    const updatedMeeting = await populateMeetingQuery(Meeting.findById(id));

    res.status(200).json({
      success: true,
      message: `Meeting marked as ${status.toLowerCase()}.`,
      data: formatMeeting(updatedMeeting),
    });
  } catch (error) {
    console.error("Update Meeting Status Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

export const addMeetingMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid meeting selected." });
    }

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Message text is required." });
    }

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ success: false, message: "Meeting not found." });
    }

    const currentUserId = req.user._id.toString();
    const isParticipant =
      meeting.sellerId?.toString() === currentUserId || meeting.buyerId?.toString() === currentUserId;

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "You cannot chat in this meeting." });
    }

    meeting.messages.push({
      senderId: req.user._id,
      text: text.trim(),
    });

    await meeting.save();

    const updatedMeeting = await populateMeetingQuery(Meeting.findById(id));

    res.status(201).json({
      success: true,
      message: "Message sent.",
      data: formatMeeting(updatedMeeting),
    });
  } catch (error) {
    console.error("Add Meeting Message Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};
