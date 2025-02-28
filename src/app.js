import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// Routes Import
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import videoRouter from "./routes/video.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

// Routes Import
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };
