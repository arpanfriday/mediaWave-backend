import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    try {
        const result = await Tweet.create({
            content: content,
            owner: new mongoose.Types.ObjectId(req.user?._id),
        });
        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    { result },
                    `tweet ${result._id} created by ${req.user?._id}`
                )
            );
    } catch (error) {
        throw new ApiError(500, error);
    }
});

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId?.userId))
        throw new ApiError(400, "user ID invalid");

    try {
        const result = await Tweet.find({
            owner: new mongoose.Types.ObjectId(userId?.userId),
        });
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    result,
                    `fetched all the tweets of user ${userId?.userId}`
                )
            );
    } catch (error) {
        throw new ApiError(500, "error fetching data: ", error);
    }
});

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId))
        throw new ApiError(400, "invalid tweet ID");
    if (!content) throw new ApiError(400, `content is missing`);

    try {
        const result = await Tweet.updateOne(
            { _id: tweetId },
            {
                content: content,
                owner: new mongoose.Types.ObjectId(req.user?._id),
            }
        );
        return res
            .status(202)
            .json(
                new ApiResponse(
                    200,
                    { result },
                    `tweet ${tweetId} updated successfully`
                )
            );
    } catch (error) {
        throw new ApiError(500, "cannot update the record: " + error);
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tweetId))
        throw new ApiError(400, "invalid tweet id");

    try {
        const result = await Tweet.deleteOne({ _id: tweetId });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { result },
                    `tweet ${tweetId} deleted successfully`
                )
            );
    } catch (error) {
        throw new ApiError(500, "cannot delete the record: " + error);
    }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
