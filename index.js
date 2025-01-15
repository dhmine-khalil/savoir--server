// server/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { isAuthenticated, authorizeRoles } from "./middleware/auth.js";
import { sendToken } from "./utils/sendToken.js";
import prisma from "./utils/prisma.js";
import bcrypt from "bcrypt";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import courseRoutes from "./routes/courseCreate.js";

// Load environment variables
dotenv.config();
const app = express();
const port = process.env.PORT || 6000;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage Configuration for Course Content
const courseStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "courses",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "png",
      "jpeg",
      "gif",
      "webp",
      "pdf",
      "mp4",
      "webm"
    ],
    transformation: [{ quality: "auto" }]
  }
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
  })
);

// Configure different upload middlewares for different types of content
const uploadImage = multer({
  storage: courseStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  }
});

const uploadVideo = multer({
  storage: courseStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only videos are allowed."));
    }
  }
});

const uploadDocument = multer({
  storage: courseStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDFs are allowed."));
    }
  }
});

// Express App Initialization

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // Configure your frontend URL
    credentials: true
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.get("/api/courses", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        courseData: true, // Include related data if needed
        benefits: true,
        prerequisites: true
      }
    });

    res.status(200).json({
      success: true,
      courses
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching courses",
      error: error.message
    });
  }
});

app.use("/api/courses", courseRoutes);

// Course Content Upload Routes
app.post(
  "/api/upload/thumbnail",
  isAuthenticated,
  authorizeRoles("ADMIN"),
  uploadImage.single("thumbnail"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No thumbnail uploaded"
        });
      }

      res.status(200).json({
        success: true,
        message: "Thumbnail uploaded successfully",
        url: req.file.path
      });
    } catch (error) {
      console.error("Thumbnail upload error:", error);
      res.status(500).json({
        success: false,
        message: "Thumbnail upload failed",
        error: error.message
      });
    }
  }
);

app.post(
  "/api/upload/video",
  isAuthenticated,
  authorizeRoles("ADMIN"),
  uploadVideo.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No video uploaded"
        });
      }

      res.status(200).json({
        success: true,
        message: "Video uploaded successfully",
        url: req.file.path
      });
    } catch (error) {
      console.error("Video upload error:", error);
      res.status(500).json({
        success: false,
        message: "Video upload failed",
        error: error.message
      });
    }
  }
);

app.post(
  "/api/upload/document",
  isAuthenticated,
  authorizeRoles("ADMIN"),
  uploadDocument.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No document uploaded"
        });
      }

      res.status(200).json({
        success: true,
        message: "Document uploaded successfully",
        url: req.file.path
      });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({
        success: false,
        message: "Document upload failed",
        error: error.message
      });
    }
  }
);

// Course Analytics Route
app.get(
  "/api/courses/analytics",
  isAuthenticated,
  authorizeRoles("ADMIN"),
  async (req, res) => {
    try {
      const analytics = await prisma.$transaction([
        prisma.course.count(),
        prisma.course.aggregate({
          _sum: {
            purchased: true
          }
        }),
        prisma.course.groupBy({
          by: ["categories"],
          _count: true
        })
      ]);

      res.status(200).json({
        success: true,
        analytics: {
          totalCourses: analytics[0],
          totalPurchases: analytics[1]._sum.purchased || 0,
          categoriesDistribution: analytics[2]
        }
      });
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics",
        error: error.message
      });
    }
  }
);

// Authentication Routes
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Send token if login is successful
    await sendToken(user, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
});

// Registration Route
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone_number, avatar } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address"
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number: phone_number ? parseFloat(phone_number) : null,
        avatar:
          avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
      }
    });

    // Send token
    await sendToken(user, res);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
});

// Get Current User
app.get("/me", isAuthenticated, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data"
    });
  }
});

// User Management Routes
app.get("/users", isAuthenticated, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
});

// Password Reset Route
app.post("/reset-password", isAuthenticated, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new passwords"
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password"
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Start Server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Graceful Shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
