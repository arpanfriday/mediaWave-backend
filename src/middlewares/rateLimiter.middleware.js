import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "../config/redisConfig.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "hoho",
    points: 5,
    duration: 10,
    execEvenly: true,
    blockDuration: 10,
    inMemoryBlockOnConsumed: 100,
});

export const rateLimit = async (req, res, next) => {
    const userIP = req.ip;
    try {
        await rateLimiter.consume(userIP);
        next();
    } catch (err) {
        res.set("Retry-After", Math.ceil(err.msBeforeNext / 1000));
        return res.status(429).json(
            new ApiResponse(
                429,
                {
                    message: `Too many requests. Please try again later.`,
                    retryAfter: Math.ceil(err.msBeforeNext / 1000),
                },
                `API limit hit`
            )
        );
    }
};
