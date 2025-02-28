import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info", // Log only info and higher levels
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
            ({ timestamp, level, message }) =>
                `${timestamp} [${level.toUpperCase()}]: ${message}`
        )
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                // format.colorize(),
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Add timestamp
                format.printf(
                    ({ timestamp, level, message }) =>
                        `${timestamp} [${level.toUpperCase()}]: ${message}`
                )
            ),
        }),
        new transports.File({
            filename: "error.log",
            level: "error", // Logs errors to error.log
        }),
        new transports.File({
            filename: "app.log",
            level: "info", // Logs all info and higher level logs
        }),
    ],
});

export default logger;
