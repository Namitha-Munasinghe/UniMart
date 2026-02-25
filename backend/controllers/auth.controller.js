import { redis } from "../lib/redis.js";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";


//generate access and refresh tokens
const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  // Store the refresh token in Redis with the user ID as the key
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // Set expiration to 7 days
}

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent xxs attacks
    secure: process.env.NODE_ENV === "production", //only send cookie over https in production
    sameSite: "strict", //prevent CSRF attacks
    maxAge: 15 * 60 * 1000, //15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });
}

export const signup = async (req, res) => {
  const { name, email, password, studentId, phone, faculty } = req.body;
  try {
    const userExists = await User.findOne({ email});

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password, studentId, phone, faculty });

    //authenticate
    const {accessToken, refreshToken} = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({ user:{
      id: user._id,
      name: user.name,
      email: user.email,
      studentId: user.studentId,
      phone: user.phone,
      faculty: user.faculty,
      role: user.role
    }, 
    message: "User created successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message});
  }
};

export const login = async (req, res) => {
  res.send("Login route called");
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if(refreshToken){
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });

  } catch (error) {
    res.status(500).json({ message:"Server error", error: error.message });
  }
};
