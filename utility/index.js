const jwt = require("jsonwebtoken");

// Utility function to generate JWT
const generateJWTtoken = (address) => {
    return jwt.sign({ address }, process.env.JWT_SECRET);
};

const generateCode = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
};

// const TWITTER_OAUTH_CLIENT_ID = "bnJDc0o1cXlWY0hVbDZ1bVpVUzY6MTpjaQ";
// const twitterOauthTokenParams = {
//     client_id: TWITTER_OAUTH_CLIENT_ID,
//     code_verifier: "8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA",
//     redirect_uri: 'https://airdrop.kaanch.com/',
//     grant_type: "authorization_code",
// };
// const TWITTER_OAUTH_CLIENT_SECRET = '9EUyAcfJG_GytwXVLRMcm24N_1Bh8A24deQoUJ_e_qrA4FBwOH';
// const BasicAuthToken = Buffer.from(`${TWITTER_OAUTH_CLIENT_ID}:${TWITTER_OAUTH_CLIENT_SECRET}`).toString("base64");

const TWITTER_OAUTH_CLIENT_ID = "bnJDc0o1cXlWY0hVbDZ1bVpVUzY6MTpjaQ";
const TWITTER_OAUTH_CLIENT_SECRET = '9EUyAcfJG_GytwXVLRMcm24N_1Bh8A24deQoUJ_e_qrA4FBwOH';

const TWITTER_OAUTH_TOKEN_URL = "https://api.x.com/2/oauth2/token";

const BasicAuthToken = Buffer.from(`${TWITTER_OAUTH_CLIENT_ID}:${TWITTER_OAUTH_CLIENT_SECRET}`, "utf8").toString(
    "base64"
);

const twitterOauthTokenParams = {
    client_id: TWITTER_OAUTH_CLIENT_ID,
    code_verifier: "8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA",
    redirect_uri: 'https://airdrop.kaanch.com/',
    grant_type: "authorization_code",
};
// const twitterOauthTokenParams = {
//     client_id: process.env.TWITTER_OAUTH_CLIENT_ID,
//     code_verifier: process.env.CODE_VERIFIER,
//     redirect_uri: process.env.TWITTER_REDIRECT_URI,
//     grant_type: process.env.GRANT_TYPE,
// };
// const X_ID = process.env.TWITTER_OAUTH_CLIENT_ID ;
// const X_SECRET_ID = process.env.TWITTER_OAUTH_CLIENT_SECRET ;
// const BasicAuthToken = Buffer.from(${X_ID}:${X_SECRET_ID}).toString("base64");
module.exports = {
    generateJWTtoken,
    twitterOauthTokenParams,
    BasicAuthToken,
    generateCode,

}