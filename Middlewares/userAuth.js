const User = require("../Models/userSchema");
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;


const Authentication = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(404).send({ data: { status: false, message: "Unauthorized! Please provide token" } });
    }

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
        return res.status(400).send({ status: 400, message: "Invalid token format! Expected 'Bearer <token>'" });
    }

    const tokenWithoutBearer = tokenParts[1];
    // console.log("tokenWithoutBearer : ", tokenWithoutBearer)

    // const rootUser = await User.findOne({ jwtToken: tokenWithoutBearer });
    const rootUser = await User.aggregate([
        { $match: { jwtToken: tokenWithoutBearer } },
        {
            $lookup: {
                from: "test_nets",
                localField: "_id",
                foreignField: "user_id",
                as: "testnetData"
            }
        },
        { $unwind: { path: "$testnetData", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "main_nets",
                localField: "_id",
                foreignField: "user_id",
                as: "mainnetData"
            }
        },
        { $unwind: { path: "$mainnetData", preserveNullAndEmptyArrays: true } },
    ]);
    if (!rootUser) {
        return res.status(404).send({ data: { message: "User not found with this token.", status: false } })
    }
    req.user = rootUser;
    next();

}


module.exports = {
    Authentication,
}