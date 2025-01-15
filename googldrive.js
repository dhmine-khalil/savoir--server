import { google } from "googleapis";
import path from "path";
import fs from "fs";

// Path to your service account key file
const SERVICE_ACCOUNT_KEY_PATH = path.join(
  __dirname,
  "./drive-service-auth.json"
);

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_PATH,
  scopes: SCOPES
});

// Initialize Google Drive API client
const drive = google.drive({ version: "v3", auth });

// Function to list files from Google Drive
export const listFiles = async () => {
  try {
    const res = await drive.files.list({
      pageSize: 10, // You can adjust the number of files
      fields: "nextPageToken, files(id, name)"
    });
    console.log("Files:", res.data.files);
    return res.data.files;
  } catch (error) {
    console.error("Error listing files:", error);
    throw new Error("Failed to list files");
  }
};

// Function to upload a file to Google Drive
export const uploadFile = async (filePath, fileName) => {
  try {
    const fileMetadata = {
      name: fileName
    };
    const media = {
      body: fs.createReadStream(filePath)
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id"
    });

    console.log("File uploaded with ID:", res.data.id);
    return res.data.id;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
};

// Function to download a file from Google Drive
export const downloadFile = async (fileId, destinationPath) => {
  try {
    const dest = fs.createWriteStream(destinationPath);
    const res = await drive.files.get(
      {
        fileId: fileId,
        alt: "media"
      },
      { responseType: "stream" }
    );

    res.data.pipe(dest);
    console.log(`File downloaded to ${destinationPath}`);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw new Error("Failed to download file");
  }
};
