import logger from "../utils/logger.js";
import morgan from "morgan";

const stream = {
    write: (message) => logger.info(message.trim()),
};

morgan.token("content-length", (_req, res) => {
    const contentLength = parseInt(res.get("content-length")) || 0;

    if (contentLength < 1024) {
        return `${contentLength} B`;
    } else if (contentLength < 1024 * 1024) {
        return `${(contentLength / 1024).toFixed(2)} KB`;
    } else {
        return `${(contentLength / (1024 * 1024)).toFixed(2)} MB`;
    }
});

morgan.token("response-time-unit", (req, _res) => {
    const diff = Date.now() - req._startTime.getTime();
    return diff >= 1000 ? `${(diff / 1000).toFixed(2)} s` : `${diff} ms`;
});

morgan.token("request-id", (req) => req.requestId);

const morganMiddleware = (req, res, next) => {
    req._startTime = Date.now(); // Start time before request

    // Log the request before being sent
    morgan("\u21b1 [:request-id] :method :url", {
        immediate: true,
        stream,
    })(req, res, () => {});

    // Log response time and content-length later
    morgan(
        "\u2190 [:request-id] :status :url :content-length - :response-time-unit",
        {
            stream,
        }
    )(req, res, next);
};

export default morganMiddleware;
