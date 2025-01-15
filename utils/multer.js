import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "course_thumbnails", // Folder in Cloudinary
    allowed_formats: ["jpg", "jpeg", "png"], // Allowed file formats
    transformation: [{ width: 800, height: 600, crop: "limit" }] // Resize image
  }
});

const upload = multer({ storage });

export default upload;
