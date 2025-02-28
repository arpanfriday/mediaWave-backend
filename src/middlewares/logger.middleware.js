import logger from "../utils/logger.js";
import morgan from "morgan";

const stream = {
    write: (message) => logger.info(message.trim()),
};
morgan.token("content-length-bytes", (req, res) => {
    const contentLength = res.get("content-length");
    return contentLength ? `${contentLength} bytes` : "0 bytes";
});

const morganConfig = morgan(
    ":method :url :status :content-length-bytes - :response-time ms",
    {
        stream,
    }
);

export default morganConfig;
