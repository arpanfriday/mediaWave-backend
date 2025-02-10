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
            fs.unlinkSync(localFilePath);
            console.log(
                "File uplodaded on: ",
                result.url,
                "and unlinked from filesystem"
            );
            return result;
        })
        .catch((error) => {
            // TODO: Implement a retry strategy here. If the upload fails by any change, the upload will be retried
            fs.unlinkSync(localFilePath);
            console.error(error);
            return null;
        });
    return uploadResult;
};

const deleteFromCloudinary = async (public_id) => {
    if (!public_id) return null;

    // Delete from Cloudinary
    const deleteResult = await cloudinary.uploader
        .destroy(public_id, {
            resource_type: "image",
            invalidate: true,
        })
        .then((result) => {
            console.log("File deleted!!");
            return result;
        })
        .catch((error) => {
            console.log(error);
            return null;
        });
    return deleteResult;
};

export { uploadToCloudinary, deleteFromCloudinary };
