import logger from "../utils/logger.js";
import morgan from "morgan";

const stream = {
    write: (message) => logger.info(message.trim()),
};
morgan.token("content-length", (req, res) => {
    const contentLength = parseInt(res.get("content-length")) || 0;

    if (contentLength < 1024) {
        return `${contentLength} B`;
    } else if (contentLength < 1024 * 1024) {
        return `${(contentLength / 1024).toFixed(2)} KB`;
    } else {
        return `${(contentLength / (1024 * 1024)).toFixed(2)} MB`;
    }
});

const morganConfig = morgan(
    ":method :url :status :content-length - :response-time ms",
    {
        stream,
    }
);

export default morganConfig;
