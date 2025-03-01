import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    const result = await Subscription.aggregate([
        {
            $match: {
                $and: [
                    { channel: new mongoose.Types.ObjectId(channelId) },
                    { subscriber: new mongoose.Types.ObjectId(req.user?._id) },
                ],
            },
        },
    ]);

    if (result?.length === 0) {
        Subscription.create([
            {
                channel: new mongoose.Types.ObjectId(channelId),
                subscriber: new mongoose.Types.ObjectId(req.user?._id),
            },
        ])
            .then((result) => {
                return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            { subscribed: true, result: result },
                            `user ${req.user?._id} subscribed to the channel ${channelId}`
                        )
                    );
            })
            .catch((error) => {
                return new ApiError(400, error);
            });
    } else {
        Subscription.deleteOne({
            _id: new mongoose.Types.ObjectId(result?.[0]?._id),
        })
            .then((result) => {
                return res
                    .status(200)
                    .json(
                        new ApiResponse(
                            200,
                            { subscribed: false, result: [result] },
                            `user ${req.user?._id} unsubscribed to the channel ${channelId}`
                        )
                    );
            })
            .catch((error) => {
                return new ApiError(400, error);
            });
    }
});

// controller to return subscriber list of a channel
const getSubscribersOfChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const result = await Subscription.find({
        channel: new mongoose.Types.ObjectId(channelId),
    });
    if (result?.length != 0)
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { result },
                    `subscribers of channel ${channelId} fetched successfully`
                )
            );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { result },
                `no subscribers fetched for channel ${channelId}`
            )
        );
});

// controller to return channel list to which user has subscribed
const getChannelsSubscribedTo = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const result = await Subscription.find({
        subscriber: new mongoose.Types.ObjectId(subscriberId),
    });
    if (result?.length != 0)
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { result },
                    `subscriptions of user ${subscriberId} fetched successfully`
                )
            );
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { result },
                `user ${subscriberId} has no subscriptions`
            )
        );
});

export { toggleSubscription, getSubscribersOfChannel, getChannelsSubscribedTo };
