import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    Tweet.create({
        content: content,
        owner: new mongoose.Types.ObjectId(req.user?._id),
    })
        .then((result) => {
            return res
                .status(201)
                .json(
                    new ApiResponse(
                        200,
                        { result },
                        "Tweet created successfully"
                    )
                );
        })
        .catch((error) => {
            return new ApiError(500, "Cannot create the record:\n" + error);
        });
});

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.params;

    Tweet.find({ owner: new mongoose.Types.ObjectId(userId?.userId) })
        .then((result) => {
            return res
                .status(200)
                .json(new ApiResponse(200, result, "Fetched all the tweets"));
        })
        .catch((error) => {
            new ApiError(500, "Error fetching data:\n", error);
        });
});

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;
    Tweet.updateOne(
        { _id: tweetId },
        {
            content: content,
            owner: new mongoose.Types.ObjectId(req.user?._id),
        }
    )
        .then((result) => {
            return res
                .status(202)
                .json(
                    new ApiResponse(
                        200,
                        { result },
                        "Tweet updated successfully"
                    )
                );
        })
        .catch((error) => {
            return new ApiError(500, "Cannot update the record:\n" + error);
        });
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    Tweet.deleteOne({ _id: tweetId })
        .then((result) => {
            return res
                .status(204)
                .json(
                    new ApiResponse(
                        200,
                        { result },
                        "Tweet deleted successfully"
                    )
                );
        })
        .catch((error) => {
            return new ApiError(500, "Cannot delete the record:\n" + error);
        });
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
