import { Router } from "express";
import {
    changeCurrentPassword,
    getLoggedInUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
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

export default router;
