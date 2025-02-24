import connectDB from "./db/index.js";
import { app } from "./app.js";

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error("ERROR: " + error);
            throw new Error("ERROR: " + error);
        });
        app.listen(process.env.PORT || 8000, () => {
            console.log(
                `Server is running at port: ${process.env.PORT}\n==========================================================`
            );
        });
    })
    .catch((err) => {
        console.error("Mongo DB connection failed :( " + err);
    });

// import express from "express";
// const app = express();
// async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on("error", (error) => {
//             console.error("ERROR: " + error);
//             throw error;
//         });
//         app.listen(process.env.PORT, () => {
//             console.log("App listening on port " + process.env.PORT);
//         });
//     } catch (error) {
//         console.error("ERROR: " + error);
//         throw error;
//     }
// };
