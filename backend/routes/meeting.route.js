import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  addMeetingMessage,
  createMeeting,
  getBuyerMeetings,
  getSellerMeetings,
  updateMeetingStatus,
} from "../controllers/meeting.controller.js";

const router = express.Router();

router.use(protectRoute);

router.get("/buyer", getBuyerMeetings);
router.get("/seller", getSellerMeetings);
router.post("/", createMeeting);
router.patch("/:id/status", updateMeetingStatus);
router.post("/:id/messages", addMeetingMessage);

export default router;
