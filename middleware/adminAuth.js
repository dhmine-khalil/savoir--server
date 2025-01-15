// server/middleware/adminAuth.js
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export const isAdminAuthenticated = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login to access this resource"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if user is an admin
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin rights required"
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message
    });
  }
};

// Seed admin user creation utility
export const createAdminUser = async (email, password, name) => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return existingAdmin;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
        verified: true
      }
    });

    return adminUser;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};
