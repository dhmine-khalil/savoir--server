import { ZodError } from "zod";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate the entire request body against the provided Zod schema
      const validationResult = schema.parse(req.body);

      // If validation passes, replace req.body with the parsed (and potentially transformed) data
      req.body = validationResult;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // If Zod validation fails, return a detailed error response
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message
          }))
        });
      }

      // Handle other types of errors
      return res.status(500).json({
        message: "An unexpected error occurred during validation",
        error: error.message
      });
    }
  };
};
