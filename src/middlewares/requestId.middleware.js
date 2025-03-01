import { v4 as uuidv4 } from "uuid";

const requestIdMiddleware = (req, res, next) => {
    req.requestId = uuidv4(); // Generate Unique Request ID
    res.setHeader("X-Request-ID", req.requestId); // Optional (Return Request ID in Response Headers)
    next();
};

export default requestIdMiddleware;
