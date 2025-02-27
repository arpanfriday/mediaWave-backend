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
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "title",
        sortType = "desc",
        userId,
    } = req.query;

    if (!req.user) {
        throw new ApiError(401, "User needs to be logged in");
    }

    const match = {
        ...(query ? { title: { $regex: query, $options: "i" } } : {}),
        ...(userId ? { owner: mongoose.Types.ObjectId(userId) } : {}),
    };

    const videosAggregation = Video.aggregate([
        {
            $match: match,
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "videosByOwner",
            },
        },
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                owner: {
                    $arrayElemAt: ["$videosByOwner", 0],
                },
            },
        },
        {
            $sort: {
                [sortBy]: sortType === "desc" ? -1 : 1,
            },
        },
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
    };

    const videos = await Video.aggregatePaginate(videosAggregation, options);

    if (!videos?.docs?.length) {
        throw new ApiError(404, "Videos are not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
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
    if (!mongoose.Types.ObjectId.isValid(videoId))
        throw new ApiError(400, "No valid video ID found");

    const video = await Video.findById(videoId);
    return res.status(200).json(new ApiResponse(200, video));
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
