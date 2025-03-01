import logger from "./logger.js";

class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
        this.logMessage();
    }

    logMessage() {
        // Log the error message along with the stack trace
        logger.info(this.message);
    }
}

export { ApiResponse };
