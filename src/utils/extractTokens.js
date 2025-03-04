export function extractTokens(context, events, done) {
    const cookies = context.vars.authToken; // ["accessToken=xxx", "refreshToken=yyy"]

    console.log("Raw Cookies: ", cookies);

    if (cookies && Array.isArray(cookies)) {
        // Access Token Extraction
        const accessToken = cookies
            .find((cookie) => cookie.includes("accessToken"))
            ?.match(/accessToken=([^;]+)/)?.[1];

        console.log("Extracted Access Token: ", accessToken);

        // Refresh Token Extraction
        const refreshToken = cookies
            .find((cookie) => cookie.includes("refreshToken"))
            ?.match(/refreshToken=([^;]+)/)?.[1];

        console.log("Extracted Refresh Token: ", refreshToken);

        // Save Tokens to Context Variables
        context.vars.accessToken = accessToken;
        context.vars.refreshToken = refreshToken;
    }
    return done();
}
