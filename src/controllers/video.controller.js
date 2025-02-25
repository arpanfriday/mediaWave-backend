import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    deleteFromCloudinary,
    uploadToCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
    const videoLocalPath = req.files?.videoFile?.[0]?.path;

    if (!thumbnailLocalPath)
        throw new ApiError(400, "Thumbnail file is required");
    if (!videoLocalPath) throw new ApiError(400, "Video file is required");

    const thumbnail = await uploadToCloudinary(thumbnailLocalPath);
    const video = await uploadToCloudinary(videoLocalPath);

    const result = await Video.create({
        videoFile: video,
        thumbnail: thumbnail,
        title,
        description,
        duration: video.duration,
        isPublished: video ? true : false,
        owner: new mongoose.Types.ObjectId(req.user?._id),
    });

    return res.status(201).json(new ApiResponse(200, result, "Successful"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const video = await Video.findOne({ _id: videoId });

        const videoDeleteResult = await deleteFromCloudinary(
            video?.videoFile?.public_id,
            video?.videoFile?.resource_type
        );

        const thumbnailDeleteResult = await deleteFromCloudinary(
            video?.thumbnail?.public_id,
            video?.thumbnail?.resource_type
        );

        if (videoDeleteResult.result !== "ok")
            throw new Error(`Failed to delete video: ${video?.videoFile}`);
        if (thumbnailDeleteResult.result !== "ok")
            throw new Error(`Failed to delete thumbnail: ${video?.thumbnail}`);

        const recordDeleteResult = await Video.deleteOne({
            _id: videoId,
        }).session(session);

        await session.commitTransaction();
        session.endSession();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { recordDeleteResult },
                    "Record deleted successfully"
                )
            );
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return new ApiError(500, `Something went wrong:\n${error}`);
    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
};
