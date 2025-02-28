import swaggerJsDoc from "swagger-jsdoc";

const swaggerDefinition = {
    openapi: "3.0.0",
    info: {
        title: "MediaWave API",
        version: "1.0.0",
        description: "API documentation for MediaWave backend",
        contact: {
            name: "Developer",
            email: "arpanriju2000@gmail.com",
        },
        servers: [
            {
                url: "http://localhost:8000/api/v1",
                description: "Development server",
            },
        ],
    },
};

const swaggerOptions = {
    swaggerDefinition,
    apis: ["./routes/*.js"], // Path to the API docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

export default swaggerDocs;
