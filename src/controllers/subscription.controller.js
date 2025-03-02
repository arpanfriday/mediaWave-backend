import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId))
        throw new ApiError(400, "invalid channel ID");

    const subscription = await Subscription.aggregate([
        {
            $match: {
                $and: [
                    { channel: new mongoose.Types.ObjectId(channelId) },
                    { subscriber: new mongoose.Types.ObjectId(req.user?._id) },
                ],
            },
        },
    ]);

    if (subscription?.length === 0) {
        try {
            const result = await Subscription.create([
                {
                    channel: new mongoose.Types.ObjectId(channelId),
                    subscriber: new mongoose.Types.ObjectId(req.user?._id),
                },
            ]);

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { subscribed: true, result: result },
                        `user ${req.user?._id} subscribed to the channel ${channelId}`
                    )
                );
        } catch (error) {
            throw new ApiError(400, error);
        }
    } else {
        try {
            const result = await Subscription.deleteOne({
                _id: new mongoose.Types.ObjectId(subscription?.[0]?._id),
            });
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { subscribed: false, result: [result] },
                        `user ${req.user?._id} unsubscribed to the channel ${channelId}`
                    )
                );
        } catch (error) {
            throw new ApiError(400, error);
        }
    }
});

// controller to return subscriber list of a channel
const getSubscribersOfChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId))
        throw new ApiError(400, "invalid channel ID");

    try {
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
    } catch (error) {
        throw new ApiError(404, error);
    }
});

// controller to return channel list to which user has subscribed
const getChannelsSubscribedTo = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subscriberId))
        throw new ApiError(400, "invalid subscriber ID");

    try {
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
    } catch (error) {
        throw new ApiError(400, error);
    }
});

export { toggleSubscription, getSubscribersOfChannel, getChannelsSubscribedTo };
