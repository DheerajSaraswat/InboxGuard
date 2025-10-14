import cloudinary from "../config/cloudinaryConfig.js";
import fs from "fs"

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "inboxguard",
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath); // remove temp file
    return response; // contains url, public_id, etc.
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export {uploadOnCloudinary};
