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
