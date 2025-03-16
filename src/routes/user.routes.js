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
    getAllUsers,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { rateLimit } from "../middlewares/rateLimiter.middleware.js";

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
/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     summary: Authenticate user and return access & refresh tokens
 *     description: Logs in the user and returns JWT access and refresh tokens.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loginString:
 *                 type: string
 *                 example: "snehasmiles"
 *               password:
 *                 type: string
 *                 example: "hello987"
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ..."
 *       400:
 *         description: Invalid request payload
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       500:
 *         description: Internal server error
 */
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

router.route("/get-all-users").get(verifyJWT, getAllUsers);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/update-user-details").post(verifyJWT, updateAccountDetails);

router
    .route("/get-profile/:username")
    .post(verifyJWT, rateLimit, getUserChannelProfile);

router.route("/get-watch-history").post(verifyJWT, getWatchHistory);

export default router;
