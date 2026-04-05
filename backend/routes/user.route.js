import express from "express";
import { deleteAccount, updateInterests, updateProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.put("/update-profile", protectRoute, updateProfile);
router.put("/interests", protectRoute, updateInterests);
router.delete("/delete-account", protectRoute, deleteAccount);

export default router;
