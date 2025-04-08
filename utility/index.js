const jwt = require("jsonwebtoken");

// Utility function to generate JWT
const generateJWTtoken = (address) => {
    return jwt.sign({ address }, process.env.JWT_SECRET);
};

const TWITTER_OAUTH_CLIENT_ID = "bnJDc0o1cXlWY0hVbDZ1bVpVUzY6MTpjaQ";
const twitterOauthTokenParams = {
    client_id: TWITTER_OAUTH_CLIENT_ID,
    code_verifier: "8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA",
    redirect_uri: 'https://airdrop.kaanch.com/',
    grant_type: "authorization_code",
};
const TWITTER_OAUTH_CLIENT_SECRET = '9EUyAcfJG_GytwXVLRMcm24N_1Bh8A24deQoUJ_e_qrA4FBwOH';
const BasicAuthToken = Buffer.from(`${TWITTER_OAUTH_CLIENT_ID}:${TWITTER_OAUTH_CLIENT_SECRET}`).toString("base64");


module.exports = {
    generateJWTtoken,
    twitterOauthTokenParams,
    BasicAuthToken
}