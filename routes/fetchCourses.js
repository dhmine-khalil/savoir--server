import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const router = express.Router();

// Fetch All Courses
router.get("/", async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            contents: true
          }
        },
        resources: true,
        assessments: {
          include: {
            questions: true
          }
        }
      }
    });

    res.status(200).json({
      message: "Courses fetched successfully",
      courses
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      message: "Failed to fetch courses",
      error: error.message
    });
  }
});

export default router;
