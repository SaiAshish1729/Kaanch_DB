const User = require("../Models/userSchema");
const { generateJWTtoken, twitterOauthTokenParams, BasicAuthToken } = require("../utility");
const ethers = require("ethers")
const axios = require("axios");
const { default: mongoose } = require("mongoose");
const Test_Net = require("../Models/testNetSchema");
const Main_Net = require("../Models/mainNetSchema");

const refferedUser = async (req, res) => {
    try {
        const { referralId, address } = req.query;


        if (!address) {
            return res.status(400).json({ data: { status: false, message: "Address is missing" } });
        }
        if (ethers.utils.isAddress(address)) {
            // Check if the user already exists
            let existingUser = await User.findOne({ address });
            if (existingUser) {
                return res.status(200).send({
                    data: {
                        status: true, message: "Sign in successfully.", token: existingUser.jwtToken
                    }
                }
                )
            } else {
                if (!referralId) {
                    return res.status(400).json({ data: { status: false, message: "Referral ID missing" } });
                }
                let referralUser = await User.findOne({ invide_code: referralId });
                if (!referralUser) {
                    return res.status(404).json({ data: { status: false, message: "Invalid referral code" } });
                }
                const token = generateJWTtoken(address);
                const newUser = new User({
                    jwtToken: token,
                    address,
                    referralId,
                });
                await newUser.save();

                const testNet = new Test_Net({
                    user_id: newUser._id
                })
                await testNet.save();
                const mainNet = new Main_Net({
                    user_id: newUser._id
                });
                await mainNet.save();

                res.status(201).json({
                    data: {
                        status: true, message: "User registered and sign in successfully.", token,
                    }
                });

            }
        } else {
            return res.status(200).send({ data: { status: false, message: "Invalid address." } })
        }


    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error occured while sign in by referal_Id.", error });
    }
}

// fetch user details
const userDetails = async (req, res) => {
    try {
        const user = req.user;
        return res.status(200).send({ data: { status: true, message: "User details fetched successfully.", result: user } });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Server error while fetching user details.", error });
    }
}

// twitter auth
const twitterAuth = async (req, res) => {
    try {
        const { code } = req.query;
        // console.log("Code : ", code);

        const responseType = await axios.post(
            process.env.TWITTER_OAUTH_TOKEN_URL,
            new URLSearchParams({ ...twitterOauthTokenParams, code }).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: `Basic ${BasicAuthToken}`,
                },
            }
        );
        console.log(responseType)
        const accessToken = responseType.data.access_token;
        // res.status(200).send({data:accessToken,status:true})
        const res2 = await fetch("https://api.x.com/2/users/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            },

        });
        const data2 = await res2.json();
        console.log("data2", data2);
        res.status(200).send({
            // data: data2,
            status: true
        })
    } catch (error) {
        console.error('Error while twitter auth:', error);
        res.status(500).send({ message: 'Error while twitter auth', error });
    }
}
const TWITTER_OAUTH_TOKEN_URL = "https://api.x.com/2/oauth2/token"
const TWITTER_OAUTH_CLIENT_ID = "8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA" //
const TWITTER_REDIRECT_URI = "https://airdrop.kaanch.com/"
const TWITTER_CODE_VERIFIER = "8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA"
const TWITTER_OAUTH_CLIENT_SECRET = '9EUyAcfJG_GytwXVLRMcm24N_1Bh8A24deQoUJ_e_qrA4FBwOH'; //

// const twitterAuth = async (req, res) => {
//     try {
//         const { code } = req.query;
//         if (!code) return res.status(400).send({ message: "Missing auth code" });

//         const tokenParams = new URLSearchParams({
//             client_id: TWITTER_OAUTH_CLIENT_ID,
//             code_verifier: TWITTER_CODE_VERIFIER,
//             redirect_uri: TWITTER_REDIRECT_URI,
//             grant_type: "authorization_code",
//             code: code,
//         });

//         const basicAuth = Buffer.from(
//             `${TWITTER_OAUTH_CLIENT_ID}:${TWITTER_OAUTH_CLIENT_SECRET}`
//         ).toString("base64");

//         const response = await axios.post(
//             TWITTER_OAUTH_TOKEN_URL,
//             tokenParams.toString(),
//             {
//                 headers: {
//                     "Content-Type": "application/x-www-form-urlencoded",
//                     Authorization: `Basic ${basicAuth}`,
//                 },
//             }
//         );

//         const accessToken = response.data.access_token;

//         const res2 = await fetch("https://api.twitter.com/2/users/me", {
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//         });

//         const data2 = await res2.json();
//         res.status(200).send({ data: data2, status: true });

//     } catch (error) {
//         console.error('Error while twitter auth:', error.response?.data || error);
//         res.status(500).send({ message: 'Error while twitter auth', error: error.response?.data || error });
//     }
// };


const updateUserDetails = async (req, res) => {
    try {
        const user = req.user;
        // console.log("User : ", user.points)
        const userId = user._id.toString();
        const {
            // testNet data
            twitterUID, displayName, photoURL,
            followKnchOnX, Dispathch_Wallet, Join_Group, testnet_faucet_claim, hashes, GenerateMainnetAccessCode,
            // mainNet data
            bridge, mainnet_faucet_claim, RegisterKaanchDomain } = req.body;

        const testNetData = await Test_Net.findOne({ user_id: userId });
        // console.log("testNet : ", testNetData);
        const mainNetData = await Main_Net.findOne({ user_id: userId });
        if (!testNetData || !mainNetData) {
            return res.status(404).send({ message: "User's testnet or mainnet data not found" });
        }

        if (followKnchOnX && testNetData.twitterId.twitterUID === null) {
            return res.status(400).send({ message: "Please connect X before following us." });
        }

        if (Dispathch_Wallet && !testNetData.followKnchOnX) {
            return res.status(400).send({ message: "Please follow on followKnchOnX before updating Dispatch Wallet." });
        }

        if (Join_Group && !testNetData.Dispathch_Wallet) {
            return res.status(400).send({ message: "Please complete Dispatch Wallet before joining group." });
        }

        if (testnet_faucet_claim && !testNetData.Join_Group) {
            return res.status(400).send({ message: "Join the group before claiming testnet faucet." });
        }

        if (GenerateMainnetAccessCode && !testNetData.testnet_faucet_claim) {
            return res.status(400).send({ message: "Claim the testnet faucet before generating mainnet access code." });
        }

        // mainNet checkinngs ...
        if (mainnet_faucet_claim && !mainNetData.bridge) {
            return res.status(400).send({ message: "Bridge is required before claiming mainnet faucet." });
        }

        if (RegisterKaanchDomain && !mainNetData.mainnet_faucet_claim) {
            return res.status(400).send({ message: "Claim mainnet faucet before registering domain." });
        }

        // Step 3
        const testnetUpdates = {};
        const mainnetUpdates = {};

        if (twitterUID || displayName || photoURL) {
            testnetUpdates["twitterId"] = {
                twitterUID: twitterUID ?? testNetData.twitterId.twitterUID,
                displayName: displayName ?? testNetData.twitterId.displayName,
                photoURL: photoURL ?? testNetData.twitterId.photoURL
            };
        }

        if (followKnchOnX !== undefined) testnetUpdates.followKnchOnX = followKnchOnX;
        if (Dispathch_Wallet !== undefined) testnetUpdates.Dispathch_Wallet = Dispathch_Wallet;
        if (Join_Group !== undefined) testnetUpdates.Join_Group = Join_Group;
        if (testnet_faucet_claim !== undefined) testnetUpdates.testnet_faucet_claim = testnet_faucet_claim;
        if (hashes !== undefined) testnetUpdates.hashes = hashes;
        if (GenerateMainnetAccessCode !== undefined) testnetUpdates.GenerateMainnetAccessCode = GenerateMainnetAccessCode;

        if (bridge !== undefined) mainnetUpdates.bridge = bridge;
        if (mainnet_faucet_claim !== undefined) mainnetUpdates.mainnet_faucet_claim = mainnet_faucet_claim;
        if (RegisterKaanchDomain !== undefined) mainnetUpdates.RegisterKaanchDomain = RegisterKaanchDomain;

        // Step 4
        // console.log(testnetUpdates)
        // console.log(mainnetUpdates);
        if (Object.keys(testnetUpdates).length > 0) {
            // console.log(testnetUpdates)
            await Test_Net.updateOne({ user_id: userId }, { $set: testnetUpdates });
            if (GenerateMainnetAccessCode !== "") {
                const currentPoints = parseInt(user.points);
                const newPoint = currentPoints + 100;
                await User.findOneAndUpdate({ _id: userId }, { points: newPoint.toString() })
            }
        }

        if (Object.keys(mainnetUpdates).length > 0) {
            await Main_Net.updateOne({ user_id: userId }, { $set: mainnetUpdates });
            const currentPoints = parseInt(user.points);
            const newPoint = currentPoints + 10;
            await User.findOneAndUpdate({ _id: userId }, { points: newPoint.toString() })
        }
        return res.status(200).send({
            success: true, message: "User details updated successfully.",
            // data: req.user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Server error while updating user details.", error });
    }
}

// top 50 highest point users
const topFiftyPointUsers = async (req, res) => {
    try {
        const topUsers = await User.aggregate([
            {
                $addFields: {
                    pointsAsNumber: { $toInt: "$points" }
                }
            },
            {
                $sort: { pointsAsNumber: -1 } // Descending
            },
            {
                $limit: 50
            },
            {
                $project: {
                    _id: 1,
                    address: 1,
                    referralId: 1,
                    invide_code: 1,
                    points: 1
                }
            }
        ]);

        return res.status(200).send({
            success: true,
            message: "Top 50 users fetched successfully.",
            data: topUsers
        });

    } catch (error) {
        console.error("Error fetching top users:", error);
        return res.status(500).send({
            success: false,
            message: "Server error while fetching top users.",
            error
        });
    }
};

module.exports = {
    refferedUser,
    userDetails,
    updateUserDetails,
    twitterAuth,
    topFiftyPointUsers,
}