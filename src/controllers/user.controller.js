import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // TODO: Replace with JOI schema validatio
    if (fullName === "" || fullName === undefined)
        throw new ApiError(400, "fullName is required");
    if (email === "" || email === undefined)
        throw new ApiError(400, "email is required");
    if (username === "" || username === undefined)
        throw new ApiError(400, "username is required");
    if (password === "" || password === undefined)
        throw new ApiError(400, "password is required");

    // Check if registering user already exists
    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
    // Check for multer avatar and coverimage
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

    // Upload image to cloudinary
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverImage = await uploadToCloudinary(coverImageLocalPath);

    if (!avatar) throw new ApiError(400, "Avatar file is required");

    // insert User to db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    });
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

export { registerUser };
