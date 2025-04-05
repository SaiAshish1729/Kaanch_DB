const jwt = require("jsonwebtoken");

// Utility function to generate JWT
const generateJWTtoken = (address) => {
    return jwt.sign({ address }, process.env.JWT_SECRET);
};

module.exports = {
    generateJWTtoken,
}