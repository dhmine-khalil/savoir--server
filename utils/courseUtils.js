import prisma from "./prisma.js";
import { uploadToCloudinary } from "./cloudinary.js";

// Utility to create a course
export const createCourse = async (courseData) => {
  try {
    // Upload thumbnail to Cloudinary if present
    if (courseData.thumbnail && courseData.thumbnail.startsWith("data:")) {
      const uploadResult = await uploadToCloudinary(courseData.thumbnail);
      courseData.thumbnail = uploadResult.secure_url;
    }

    // Upload demo video URL to Cloudinary if present
    if (courseData.demoUrl && courseData.demoUrl.startsWith("data:")) {
      const uploadResult = await uploadToCloudinary(courseData.demoUrl);
      courseData.demoUrl = uploadResult.secure_url;
    }

    // Create course in the database
    const course = await prisma.course.create({
      data: {
        ...courseData,
        price: parseFloat(courseData.price),
        estimatedPrice: courseData.estimatedPrice
          ? parseFloat(courseData.estimatedPrice)
          : undefined,
        duration: courseData.duration
          ? parseFloat(courseData.duration)
          : undefined
      }
    });

    return { success: true, course };
  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error("Failed to create course");
  }
};
