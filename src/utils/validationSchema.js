import joi from "joi";

function validateUser(user) {
    // schema validation for user
    const schema = joi.object({
        username: joi.string().required(),
        email: joi
            .string()
            .required()
            .email({
                minDomainSegments: 2,
                tlds: {
                    allow: ["com", "net"],
                },
            }),
        firstName: joi.string().required(),
        lastName: joi.string().required(),
        avatar: joi.string().optional(), // this is explicitely checked in the controller. Hence marked as optional here
        coverImage: joi.string().optional(),
        watchHistory: joi.array().items(joi.string()).optional(),
        password: joi.string().required(),
        refreshToken: joi.string().optional(),
    });
    return schema.validate(user);
}

function validateLogin(user) {
    const schema = joi.object({
        loginString: joi.string().required(),
        password: joi.string().required(),
    });
    return schema.validate(user);
}

export { validateUser, validateLogin };
