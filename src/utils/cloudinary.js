import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    // Upload to cloudinary
    const uploadResult = await cloudinary.uploader
        .upload(localFilePath, {
            resource_type: "auto",
        })
        .then((result) => {
            console.log("File uplodaded on: ", result.url);
            return result.original_filename;
        })
        .catch((error) => {
            fs.unlinkSync(localFilePath);
            console.error(error);
            return null;
        });
    console.log(uploadResult);
};

export { uploadToCloudinary };
