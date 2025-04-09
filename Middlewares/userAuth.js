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

    const objData = rootUser[0];
    const customResponse = {
        _id: objData._id,
        jwtToken: objData.jwtToken,
        referralId: objData.referralId,
        address: objData.address,
        invide_code: objData.invide_code,
        points: objData.points,
        twitterId: objData.testnetData.twitterId,
        followKnchOnX: objData.testnetData.followKnchOnX,
        Dispathch_Wallet: objData.testnetData.Dispathch_Wallet,
        Join_Group: objData.testnetData.Join_Group,
        testnet_faucet_claim: objData.testnetData.testnet_faucet_claim,
        hashes: objData.testnetData.hashes,
        GenerateMainnetAccessCode: objData.testnetData.GenerateMainnetAccessCode,

        // mainNet
        bridge: objData.mainnetData.bridge,
        mainnet_faucet_claim: objData.mainnetData.mainnet_faucet_claim,
        RegisterKaanchDomain: objData.mainnetData.RegisterKaanchDomain,
    }
    // console.log(customResponse)
    req.user = objData;
    req.customizedUser = customResponse
    next();

}


module.exports = {
    Authentication,
}