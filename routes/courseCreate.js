import express from "express";
import prisma from "../utils/prisma.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

// Create course
router.post("/create-course", isAuthenticated, async (req, res) => {
  try {
    const courseData = req.body;
    const course = await prisma.course.create({
      data: {
        name: courseData.name,
        description: courseData.description,
        price: courseData.price,
        estimatedPrice: courseData.estimatedPrice,
        thumbnail: courseData.thumbnail,
        tags: courseData.tags,
        level: courseData.level,
        demoUrl: courseData.demoUrl,
        duration: courseData.duration,
        categories: courseData.categories,
        userId: req.user.id,
        benefits: {
          create: courseData.benefits?.map((benefit) => ({ title: benefit }))
        },
        prerequisites: {
          create: courseData.prerequisites?.map((prerequisite) => ({
            title: prerequisite
          }))
        },
        courseData: {
          create: courseData.courseData.map((module) => ({
            title: module.title,
            description: module.description,
            videoUrl: module.videoUrl,
            videoLength: module.videoLength,
            links: {
              create: module.links?.map((link) => ({
                title: link.title,
                url: link.url
              }))
            },
            questions: {
              create: module.questions?.map((question) => ({
                question: question.question,
                answer: question.answer
              }))
            }
          }))
        },
        questions: {
          create: courseData.questions.map((q) => ({
            question: q.question,
            answer: q.answer
          }))
        },
        resources: {
          create: courseData.resources.map((resource) => ({
            title: resource.title,
            url: resource.url
          }))
        }
      },
      include: {
        courseData: true,
        benefits: true,
        prerequisites: true,
        questions: true,
        resources: true
      }
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course
    });
  } catch (error) {
    console.error("Course creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating course",
      error: error.message
    });
  }
});

router.get("/", (req, res) => {
  res.status(200).json({ message: "Course routes are working" });
});

// Fetch enrolled courses for the authenticated user
router.get("/enrolled-courses", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    // First check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Fetch enrolled courses with complete details
    const enrolledCourses = await prisma.userCourse.findMany({
      where: {
        userId: userId
      },
      include: {
        course: {
          include: {
            benefits: true,
            prerequisites: true,
            courseData: true,
            resources: true
          }
        }
      }
    });

    // Transform the data to return only the courses
    const courses = enrolledCourses.map((enrollment) => enrollment.course);

    return res.status(200).json({
      success: true,
      courses: courses
    });
  } catch (error) {
    console.error("Error in enrolled-courses endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// Get course by ID
router.get("/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        benefits: true,
        prerequisites: true,
        courseData: {
          include: {
            links: true,
            questions: {
              include: {
                CourseQuestionAnswers: true
              }
            }
          }
        },
        questions: {
          include: {
            CourseQuestionAnswers: true
          }
        },
        resources: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            },
            replies: {
              include: {
                user: {
                  select: {
                    name: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    console.error("Course fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching course",
      error: error.message
    });
  }
});

// Check enrollment status
router.get("/check-enrollment/:courseId", isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.userCourse.findFirst({
      where: {
        courseId,
        userId
      }
    });

    res.status(200).json({
      success: true,
      isEnrolled: !!enrollment
    });
  } catch (error) {
    console.error("Enrollment check error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking enrollment status",
      error: error.message
    });
  }
});

// Enroll in course
router.post("/enroll/:courseId", isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const existingEnrollment = await prisma.userCourse.findFirst({
      where: { courseId, userId }
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "Already enrolled in this course"
      });
    }

    const enrollment = await prisma.userCourse.create({
      data: {
        courseId,
        userId
      }
    });

    await prisma.course.update({
      where: { id: courseId },
      data: {
        NumberOfUsersRegisteredForThisCourse: {
          increment: 1
        }
      }
    });

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in course",
      enrollment
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    res.status(500).json({
      success: false,
      message: "Error enrolling in course",
      error: error.message
    });
  }
});

// Start course
router.post("/start-course/:courseId", isAuthenticated, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const enrollment = await prisma.userCourse.findFirst({
      where: { courseId, userId }
    });

    if (enrollment) {
      return res.status(200).json({
        success: true,
        isEnrolled: true,
        message: "User already enrolled."
      });
    }

    const newEnrollment = await prisma.userCourse.create({
      data: { courseId, userId }
    });

    await prisma.course.update({
      where: { id: courseId },
      data: {
        NumberOfUsersRegisteredForThisCourse: {
          increment: 1
        }
      }
    });

    res.status(201).json({
      success: true,
      isEnrolled: true,
      message: "Successfully enrolled and started the course.",
      enrollment: newEnrollment
    });
  } catch (error) {
    console.error("Error in start-course endpoint:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start the course",
      error: error.message
    });
  }
});

router.get("/my-courses", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    // First check if user exists and has any enrollments
    const userWithEnrollments = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userCourses: true
      }
    });

    if (!userWithEnrollments || userWithEnrollments.userCourses.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No enrolled courses found",
        courses: []
      });
    }

    // Fetch enrolled courses with complete details
    const enrolledCourses = await prisma.userCourse.findMany({
      where: { userId },
      select: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
            thumbnail: true,
            duration: true,
            price: true,
            level: true,
            categories: true,
            demoUrl: true,
            createdAt: true,
            courseData: {
              select: {
                id: true,
                title: true,
                description: true,
                videoUrl: true,
                videoLength: true
              }
            },
            benefits: {
              select: {
                id: true,
                title: true
              }
            },
            prerequisites: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    // Transform the data structure to make it cleaner
    const formattedCourses = enrolledCourses.map(
      (enrollment) => enrollment.course
    );

    res.status(200).json({
      success: true,
      courses: formattedCourses
    });
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching enrolled courses",
      error: error.message
    });
  }
});
export default router;
