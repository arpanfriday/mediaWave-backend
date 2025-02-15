import { Router } from "express";
import {
    toggleSubscription,
    getSubscribersOfChannel,
    getChannelsSubscribedTo,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/c/:channelId")
    .get(getSubscribersOfChannel)
    .post(toggleSubscription);

router.route("/c/:subscriberId").get(getChannelsSubscribedTo);

export default router;
