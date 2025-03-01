import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message, stack }) => {
            let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
            if (stack) {
                log += `\nStack Trace:\n${stack}`;
            }
            return log;
        })
    ),
    transports: [
        new transports.Console({
            level: "info",
            format: format.combine(
                // format.colorize(),
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
                format.printf(
                    ({ timestamp, level, message }) =>
                        `${timestamp} [${level.toUpperCase()}]: ${message}`
                )
            ),
        }),
        new transports.File({ filename: "app.log", level: "info" }),
        new transports.File({ filename: "error.log", level: "error" }),
    ],
});

export default logger;
