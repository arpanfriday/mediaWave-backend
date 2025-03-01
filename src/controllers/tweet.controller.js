import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res, next) => {
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
                        `tweet ${result._id} created by ${req.user?._id}`
                    )
                );
        })
        .catch((error) => {
            next(new ApiError(500, "Cannot create the record: " + error));
        });
});

const getUserTweets = asyncHandler(async (req, res, next) => {
    const userId = req.params;

    Tweet.find({ owner: new mongoose.Types.ObjectId(userId?.userId) })
        .then((result) => {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        result,
                        `fetched all the tweets of user ${userId?.userId}`
                    )
                );
        })
        .catch((error) => {
            next(new ApiError(500, "error fetching data: ", error));
        });
});

const updateTweet = asyncHandler(async (req, res, next) => {
    const { content } = req.body;
    const { tweetId } = req.params;

    if (!content) throw new ApiError(400, `content is missing`);

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
                        `tweet ${tweetId} updated successfully`
                    )
                );
        })
        .catch((error) => {
            next(new ApiError(500, "cannot update the record: " + error));
        });
});

const deleteTweet = asyncHandler(async (req, res, next) => {
    const { tweetId } = req.params;
    Tweet.deleteOne({ _id: tweetId })
        .then((result) => {
            return res
                .status(204)
                .json(
                    new ApiResponse(
                        200,
                        { result },
                        `tweet ${tweetId} deleted successfully`
                    )
                );
        })
        .catch((error) => {
            next(new ApiError(500, "cannot delete the record: " + error));
        });
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
