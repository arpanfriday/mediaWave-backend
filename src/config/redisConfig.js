import redis from "redis";
import logger from "../utils/logger.js";

const redisClient = redis.createClient();

(async () => {
    redisClient.on("error", (err) => {
        logger.error(`Redis client error: ${err}`);
    });

    redisClient.on("ready", () => {
        logger.info("Redis client started");
    });

    await redisClient.connect();

    await redisClient.ping();
})();

export default redisClient;
