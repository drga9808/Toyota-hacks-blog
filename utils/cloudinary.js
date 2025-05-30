import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

// Env variables
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const fileName = file.originalname.split(".")[0]; // remove extension
    return {
      folder: "Blog Capstone Project", // your fixed folder
      public_id: fileName,             // just the file name (no auto folder nesting)
      format: "png",                   // or use: path.extname(file.originalname).slice(1)
      transformation: [
        { width: 1400, height: 900, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" }
      ]
    };
  }
});

export { cloudinary, storage };