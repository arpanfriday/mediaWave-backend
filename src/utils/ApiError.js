import logger from "./logger.js";

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = []
        // stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        Error.captureStackTrace(this, this.constructor);
        this.logError();
    }
    logError() {
        // Log the error message along with the stack trace
        logger.error(this.message, { stack: this.stack });
    }
}

export { ApiError };
