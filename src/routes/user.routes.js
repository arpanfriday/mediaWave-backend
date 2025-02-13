import { Router } from "express";
import {
    changeCurrentPassword,
    getLoggedInUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/update-avatar").post(
    verifyJWT,
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
    ]),
    updateAvatar
);

router.route("/update-cover").post(
    verifyJWT,
    upload.fields([
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    updateCoverImage
);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").get(verifyJWT, getLoggedInUser);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/update-user-details").post(verifyJWT, updateAccountDetails);

router.route("/get-profile").post(verifyJWT, getUserChannelProfile);

router.route("/get-watch-history").post(verifyJWT, getWatchHistory);

export default router;
