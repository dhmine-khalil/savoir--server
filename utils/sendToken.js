import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const sendToken = async (user, res) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    process.env.JWT_SECRET_KEY, // Ensure this matches exactly
    {
      expiresIn: "30d" // Or your preferred expiration
    }
  );

  res.status(200).json({
    success: true,
    accessToken: token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    }
  });
};
