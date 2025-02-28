import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    const healthCheck = {
        uptime: process.uptime(),
        timestamp: Date.now(),
        responseTime: process.hrtime(),
    };
    try {
        return res.status(200).json(new ApiResponse(200, healthCheck, "OK"));
    } catch (error) {
        return res
            .status(500)
            .json(new ApiResponse(500, error, "Internal Server Error"));
    }
});

export { healthcheck };
