import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { validateUser, validateLogin } from "../utils/validationSchema.js";
import {
    deleteFromCloudinary,
    uploadToCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import redisClient from "../config/redisConfig.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, error.message);
    }
};

const registerUser = asyncHandler(async (req, res) => {
    // Validate files in Request. Check for multer avatar and coverimage
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

    // Validate the Request body
    const { error } = await validateUser(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    // Destructure the Request body and store in const variables
    const { firstName, lastName, email, username, password } = req.body;

    // Check if registering user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // Upload image to cloudinary
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    // insert User to db
    const user = await User.create({
        "fullName.firstName": firstName,
        "fullName.lastName": lastName,
        "avatar.url": avatar.url,
        "avatar.public_id": avatar.public_id,
        "coverImage.url": coverImage?.url || "",
        "coverImage.public_id": coverImage?.public_id || "",
        email,
        password,
        username: username.toLowerCase(),
    });

    // Check for created user
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    // Send Response
    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // Validate the request schema
    const { error } = await validateLogin(req.body);
    if (error) throw new ApiError(400, error.details[0].message);

    // Find the user in DB
    const user = await User.findOne({
        $or: [
            { email: req.body.loginString },
            { username: req.body.loginString },
        ],
    }).select("-refreshToken");
    if (!user) throw new ApiError(404, "User does not exist");

    // Check password validity
    const isPasswordValid = await user.validatePassword(req.body.password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid user credentials");

    // Generate Access and Refresh Tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );
    user.password = "********";
    // user.save({ validateBeforeSave: false });

    // Send the accessToken to cookies
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user, accessToken, refreshToken },
                `user ${user.username} logged in successfully`
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, `user ${user.username} Logged Out`));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.user.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh token");

    if (incomingRefreshToken !== user?.refreshToken)
        throw new ApiError(401, "Refresh token is expired or used");

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
        user._id
    );
    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken },
                "New tokes are generated"
            )
        );
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.validatePassword(oldPassword);

    if (!isPasswordCorrect) throw new ApiError(400, "Invalid old password");

    user.password = newPassword;
    await user.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

const getLoggedInUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Logged In user fetched succcessfully"
            )
        );
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { firstName, LastName, email, username } = req.body;
    // if (!fullName && !email) throw new ApiError(400, "All fields are required");
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                "fullName.firstName": firstName,
                "fullName.LastName": LastName,
                email,
                username,
            },
        },
        { new: true }
    ).select("-password");

    res.status(200).json(
        new ApiResponse(200, user, "Account Details updated successfully")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is missing");

    // Upload the new image
    const avatar = await uploadToCloudinary(avatarLocalPath);
    if (!avatar.url) throw new ApiError(400, "Failed to upload");

    // Delete the old image
    const deleteResult = await deleteFromCloudinary(req.user?.avatar.public_id);
    if (deleteResult?.result != "ok")
        throw new ApiError(500, "Failed to delete old avatar asset");

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                "avatar.url": avatar.url,
                "avatar.public_id": avatar.public_id,
            },
        },
        { new: true }
    ).select("-password");

    res.status(200).json(
        new ApiResponse(200, user, "Account avatar updated successfully")
    );
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (!coverImageLocalPath)
        throw new ApiError(400, "coverImage file is missing");

    // Upload the new image
    const coverImage = await uploadToCloudinary(coverImageLocalPath);
    if (!coverImage.url) throw new ApiError(400, "Failed to upload");

    // Delete the old image if exist
    if (req.user?.coverImage.public_id) {
        const deleteResult = await deleteFromCloudinary(
            req.user?.coverImage.public_id
        );
        if (deleteResult?.result != "ok")
            throw new ApiError(500, "Failed to delete old coverImage asset");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                "coverImage.url": coverImage.url,
                "coverImage.public_id": coverImage.public_id,
            },
        },
        { new: true }
    ).select("-password");

    res.status(200).json(
        new ApiResponse(200, user, "Account cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) throw new ApiError(400, "Username is missing");

    let channel = null;
    const key = "user-profile: " + username?.toLowerCase();
    const value = await redisClient.get(key);
    if (value) {
        channel = JSON.parse(value);
        logger.info(`cache hit`);
    } else {
        channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase(),
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers",
                },
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo",
                },
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers",
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo",
                    },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"],
                            },
                            then: true,
                            else: false,
                        },
                    },
                },
            },
            {
                $project: {
                    password: 0,
                },
            },
        ]);
        await redisClient.set(key, JSON.stringify(channel), { EX: 300 });
        logger.info(`cache miss`);
    }

    if (!channel?.length) throw new ApiError(400, "Channel does not exist");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel is fetched successfully"
            )
        );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(100, user[0].watchHistory, "Fetched watch history")
        );
});

const getAllUsers = asyncHandler(async (_req, res) => {
    try {
        const result = await User.aggregate([
            {
                $project: {
                    _id: 1,
                },
            },
        ]);

        let ids;
        result.forEach((id) => (ids += '"' + id._id.toString() + '",'));
        logger.info(`${ids}`);

        return res
            .status(200)
            .json(new ApiResponse(200, result, "all users fetched"));
    } catch (error) {
        throw new ApiError(400, error);
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getLoggedInUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    getAllUsers,
};
