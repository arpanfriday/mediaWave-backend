import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { validateUser, validateLogin } from "../utils/validationSchema.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
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
    const { fullName, email, username, password } = req.body;

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
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
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
    user.refreshToken = refreshToken;
    await user.save();
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
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $set: { refreshToken: "" } },
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
        .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const uesr = await User.findById(decodedToken?._id);
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
export { registerUser, loginUser, logoutUser, refreshAccessToken };
