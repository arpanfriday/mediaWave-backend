const metricsByEndpoint_beforeRequest = function (
    request,
    _context,
    _events,
    done
) {
    // console.log("Request Sent:", request);
    return done();
};

const metricsByEndpoint_afterResponse = function (
    _request,
    response,
    _context,
    _events,
    done
) {
    // console.log("Response Received:", response.statusCode);
    return done();
};

const extractTokens = function (context, _events, done) {
    const cookies = context.vars.authToken;

    // console.log("Raw Cookies: ", cookies);

    if (cookies && Array.isArray(cookies)) {
        // Access Token Extraction
        const accessToken = cookies
            .find((cookie) => cookie.includes("accessToken"))
            ?.match(/accessToken=([^;]+)/)?.[1];

        if (accessToken) console.log("Extracted Access Token");

        // Refresh Token Extraction
        const refreshToken = cookies
            .find((cookie) => cookie.includes("refreshToken"))
            ?.match(/refreshToken=([^;]+)/)?.[1];

        if (refreshToken) console.log("Extracted Refresh Token");

        // Save Tokens to Context Variables
        context.vars.accessToken = accessToken;
        context.vars.refreshToken = refreshToken;
    }
    return done();
};

export {
    metricsByEndpoint_beforeRequest,
    metricsByEndpoint_afterResponse,
    extractTokens,
};
