import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import User from "../model/user.model.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const { name, phone, faculty } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, phone, faculty },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const refreshToken = req.cookies.refreshToken;

    await User.findByIdAndDelete(userId);

    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );
        await redis.del(`refresh_token:${decoded.userId}`);
      } catch (error) {
        console.log("Error clearing refresh token during account deletion:", error.message);
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
