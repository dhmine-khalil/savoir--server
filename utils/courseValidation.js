// server/utils/courseValidation.js
export const validateCourseData = (courseData) => {
  // Validate required fields
  if (!courseData.name) {
    throw new Error("Course name is required");
  }

  if (!courseData.description) {
    throw new Error("Course description is required");
  }

  if (!courseData.price) {
    throw new Error("Course price is required");
  }

  // Validate price
  const price = parseFloat(courseData.price);
  if (isNaN(price) || price < 0) {
    throw new Error("Invalid course price");
  }

  // Validate course level
  const validLevels = ["Beginner", "Intermediate", "Advanced", "All_Levels"];
  if (courseData.level && !validLevels.includes(courseData.level)) {
    throw new Error("Invalid course level");
  }

  // Validate slug (if provided)
  if (courseData.slug) {
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(courseData.slug)) {
      throw new Error(
        "Invalid slug. Use lowercase letters, numbers, and hyphens only"
      );
    }
  }

  // Validate modules
  if (courseData.modules) {
    courseData.modules.forEach((module, index) => {
      if (!module.title) {
        throw new Error(`Module at index ${index} requires a title`);
      }
    });
  }

  return true;
};
