// // server/utils/courseController.js
// import prisma from "./prisma.js";
// import { uploadToCloudinary } from "./cloudinary.js";

// export const createCourseHandler = async (req, res) => {
//   try {
//     const { title, description, category, price, userId, level, duration } =
//       req.body;

//     if (!title || !description || !category) {
//       return res.status(400).json({
//         success: false,
//         message: "Title, description, and category are required."
//       });
//     }

//     const newCourse = await prisma.course.create({
//       data: {
//         name: title.substring(0, 50),
//         title,
//         description,
//         category,
//         price: parseFloat(price) || 0,
//         userId: parseInt(userId),
//         level: level || "Beginner",
//         duration: duration || "0h",
//         image: req.file?.path // Cloudinary returns the file URL in req.file.path
//       }
//     });

//     res.status(201).json({
//       success: true,
//       course: newCourse,
//       message: "Course created successfully!"
//     });
//   } catch (error) {
//     console.error("Error creating course:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error."
//     });
//   }
// };

// export const getCourseHandler = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, category, level } = req.query;

//     const skip = (page - 1) * limit;

//     const whereClause = {};
//     if (category) whereClause.category = category;
//     if (level) whereClause.level = level;

//     const courses = await prisma.course.findMany({
//       where: whereClause,
//       skip: Number(skip),
//       take: Number(limit),
//       include: {
//         _count: {
//           select: { reviews: true }
//         }
//       }
//     });

//     const totalCourses = await prisma.course.count({ where: whereClause });

//     res.status(200).json({
//       success: true,
//       courses,
//       pagination: {
//         currentPage: Number(page),
//         totalPages: Math.ceil(totalCourses / limit),
//         totalCourses
//       }
//     });
//   } catch (error) {
//     console.error("Get courses error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch courses",
//       error: error.message
//     });
//   }
// };

// export const getSingleCourseHandler = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const course = await prisma.course.findUnique({
//       where: { id: courseId },
//       include: {
//         reviews: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 avatar: true
//               }
//             }
//           }
//         }
//       }
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       course
//     });
//   } catch (error) {
//     console.error("Get single course error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch course",
//       error: error.message
//     });
//   }
// };

// export const updateCourseHandler = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const { title, description, price, category, level, duration } = req.body;

//     let imageUrl = null;
//     if (req.file) {
//       imageUrl = await uploadToCloudinary(req.file.path, "courses");
//     }

//     const updateData = {
//       title,
//       description,
//       price: price ? parseFloat(price) : undefined,
//       category,
//       level,
//       duration,
//       image: imageUrl
//     };

//     // Remove undefined values
//     Object.keys(updateData).forEach(
//       (key) => updateData[key] === undefined && delete updateData[key]
//     );

//     const course = await prisma.course.update({
//       where: { id: courseId },
//       data: updateData
//     });

//     res.status(200).json({
//       success: true,
//       course
//     });
//   } catch (error) {
//     console.error("Update course error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update course",
//       error: error.message
//     });
//   }
// };

// export const deleteCourseHandler = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     await prisma.course.delete({
//       where: { id: courseId }
//     });

//     res.status(200).json({
//       success: true,
//       message: "Course deleted successfully"
//     });
//   } catch (error) {
//     console.error("Delete course error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete course",
//       error: error.message
//     });
//   }
// };

import upload from "../config/multer.js";

router.post(
  "/create",
  upload.single("thumbnail"), // Handle thumbnail upload
  validateRequest(CourseCreationSchema),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        difficulty,
        price,
        duration,
        discountedPrice,
        isFeatured,
        learningObjectives,
        prerequisites,
        recommendedTools,
        modules,
        resources,
        assessments
      } = req.body;

      // Get the uploaded thumbnail URL from Cloudinary
      const thumbnail = req.file?.path; // Cloudinary URL

      const instructorId = req.user?.id;

      const course = await prisma.$transaction(async (tx) => {
        const newCourse = await tx.course.create({
          data: {
            name: title,
            description,
            categories: [category], // Assuming category is a single value
            price,
            estimatedPrice: discountedPrice || null,
            thumbnail: thumbnail || null, // Save thumbnail URL
            tags: [],
            level: difficulty, // Assuming difficulty is a valid CourseLevel enum value
            demoUrl: "", // Optional
            slug: title.toLowerCase().replace(/\s+/g, "-"), // Generate slug from title
            lessons: modules?.length || 0,
            learningObjectives: learningObjectives || [],
            duration,
            prerequisites: prerequisites || [],
            resources: resources || [],
            instructorId
          }
        });

        // Create Modules
        if (modules && modules.length > 0) {
          await Promise.all(
            modules.map(async (module, index) => {
              const createdModule = await tx.courseModule.create({
                data: {
                  title: module.title,
                  description: module.description || "",
                  orderIndex: index,
                  courseId: newCourse.id
                }
              });

              // Create Module Contents
              if (module.contents && module.contents.length > 0) {
                await tx.courseContent.createMany({
                  data: module.contents.map((content, contentIndex) => ({
                    title: content.title,
                    type: content.type,
                    content: content.content,
                    duration: content.duration,
                    moduleId: createdModule.id,
                    orderIndex: contentIndex
                  }))
                });
              }

              // Create Attachments
              if (module.attachments && module.attachments.length > 0) {
                await tx.moduleAttachment.createMany({
                  data: module.attachments.map((attachment) => ({
                    title: attachment.title,
                    type: attachment.type,
                    url: attachment.url,
                    description: attachment.description || "",
                    moduleId: createdModule.id
                  }))
                });
              }
            })
          );
        }

        // Create Course Resources
        if (resources && resources.length > 0) {
          await tx.courseResource.createMany({
            data: resources.map((resource) => ({
              courseId: newCourse.id,
              title: resource.title,
              type: resource.type,
              url: resource.url,
              description: resource.description || null
            }))
          });
        }

        // Create Assessments
        if (assessments && assessments.length > 0) {
          await Promise.all(
            assessments.map(async (assessment) => {
              await tx.courseAssessment.create({
                data: {
                  courseId: newCourse.id,
                  title: assessment.title,
                  type: assessment.type,
                  passingScore: assessment.passingScore,
                  questions: assessment.questions
                    ? {
                        create: assessment.questions.map((question) => ({
                          text: question.text,
                          type: question.type,
                          options: question.options,
                          correctAnswer: question.correctAnswer
                        }))
                      }
                    : undefined
                }
              });
            })
          );
        }

        return newCourse;
      });

      res.status(201).json({
        message: "Course created successfully",
        courseId: course.id
      });
    } catch (error) {
      console.error("Course creation error:", error);
      res.status(500).json({
        message: "Failed to create course",
        error: error.message
      });
    }
  }
);
