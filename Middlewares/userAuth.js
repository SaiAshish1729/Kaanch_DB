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

        {
            $lookup: {
                from: "point_calculations",
                localField: "_id",
                foreignField: "user_id",
                as: "pointCalculation"
            }
        },
        { $unwind: { path: "$pointCalculation", preserveNullAndEmptyArrays: true } },
    ]);
    if (rootUser.length === 0) {
        return res.status(404).send({ data: { message: "User not found with this token.", status: false } })
    }
    // console.log(rootUser)
    const objData = rootUser[0];
    // console.log(objData)
    const pointCalc = objData?.pointCalculation || {};
    const customResponse = {
        _id: objData?._id,
        // jwtToken: objData?.jwtToken,
        referralId: objData?.referralId,
        address: objData?.address,
        invide_code: objData?.invide_code,
        points: objData?.points,
        refferal_bridge_complition_points: objData?.refferal_bridge_complition_points,
        refferal_mainnet_completed_points: objData?.refferal_mainnet_completed_points,
        twitterId: objData?.testnetData.twitterId,
        followKnchOnX: objData?.testnetData.followKnchOnX,
        Dispathch_Wallet: objData?.testnetData.Dispathch_Wallet,
        Join_Group: objData?.testnetData.Join_Group,
        testnet_faucet_claim: objData?.testnetData.testnet_faucet_claim,
        hashes: objData?.testnetData.hashes,
        // GenerateMainnetAccessCode: objData?.testnetData.GenerateMainnetAccessCode,

        // mainNet
        bridge: objData?.mainnetData.bridge,
        // mainnet_faucet_claim: objData?.mainnetData.mainnet_faucet_claim,
        RegisterKaanchDomain: objData?.mainnetData.RegisterKaanchDomain,
        check_holding: objData?.mainnetData.check_holding[0],
        // point_calculation
        points: {
            twitter_point: objData?.pointCalculation.twitter_point,
            retweet_point: objData?.pointCalculation.retweet_point,
            join_group_point: objData?.pointCalculation.join_group_point,
            bridge_point: objData?.pointCalculation.bridge_point,
            check_holding_point: objData?.pointCalculation.check_holding_point,
            RegisterKaanchDomain_point: objData?.pointCalculation.RegisterKaanchDomain_point,
            per_refferal_point: objData?.pointCalculation.per_refferal_point,
            total_points:
                (pointCalc.twitter_point || 0) +
                (pointCalc.retweet_point || 0) +
                (pointCalc.join_group_point || 0) +
                (pointCalc.bridge_point || 0) +
                (pointCalc.check_holding_point || 0) +
                (pointCalc.RegisterKaanchDomain_point || 0) +
                (pointCalc.per_refferal_point || 0)
        }
    }
    // console.log(customResponse)
    req.user = objData;
    req.customizedUser = customResponse
    next();

}


module.exports = {
    Authentication,
}