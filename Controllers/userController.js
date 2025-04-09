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
        const { address } = req.query;
        if (!address) {
            return res.status(400).send({ data: { message: "Address is missing." } });
        } else {
            const user = req.customizedUser;
            if (user.address !== address) {
                return res.status(403).send({ data: { message: "This address is not authentic with the provided token." } });
            }
            return res.status(200).send({ data: { status: true, message: "User details fetched successfully.", result: user } });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Server error while fetching user details.", error });
    }
}

// twitter auth
// twitter auth
// twitter auth
const twitterAuth = async (req, res) => {
    try {
        const { code } = req.query;
        console.log("Code : ", code);
        console.log("twitterOauthTokenParams", twitterOauthTokenParams)

        const responseType = await axios.post(
            process.env.TWITTER_OAUTH_TOKEN_URL,
            new URLSearchParams({ ...twitterOauthTokenParams, code }).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Authorization: ` Basic ${BasicAuthToken}`,
                },
            }
        );

        const accessToken = responseType.data.access_token;
        // console.log("accessToken : ",accessToken)
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
            data: data2,
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

const updateUserDetails = async (req, res) => {
    try {
        const user = req.user;
        // console.log("User : ", req.user);
        if (user === undefined) {
            return res.status(404).send({ data: { status: false, message: "User not found with provided token." } })
        }
        const { address } = req.query;
        if (!address) {
            return res.status(403).send({ data: { status: false, message: "Address is missing." } })
        }
        if (address !== req.user.address) {
            return res.status(403).send({ data: { message: "Provided address is not matched with the token." } })
        }
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
            return res.status(404).send({ data: { message: "User's testnet or mainnet data not found" } });
        }

        if (followKnchOnX && testNetData.twitterId.twitterUID === null) {
            return res.status(400).send({ data: { message: "Please connect X before following us." } });
        }

        if (Dispathch_Wallet && !testNetData.followKnchOnX) {
            return res.status(400).send({ data: { message: "Please follow on followKnchOnX before updating Dispatch Wallet." } });
        }

        if (Join_Group && !testNetData.Dispathch_Wallet) {
            return res.status(400).send({ data: { message: "Please complete Dispatch Wallet before joining group." } });
        }

        if (testnet_faucet_claim && !testNetData.Join_Group) {
            return res.status(400).send({ data: { message: "Join the group before claiming testnet faucet." } });
        }

        if (GenerateMainnetAccessCode && !testNetData.testnet_faucet_claim) {
            return res.status(400).send({ data: { message: "Claim the testnet faucet before generating mainnet access code." } });
        }

        // mainNet checkinngs ...
        if (mainnet_faucet_claim && !mainNetData.bridge) {
            return res.status(400).send({ data: { message: "Bridge is required before claiming mainnet faucet." } });
        }

        if (RegisterKaanchDomain && !mainNetData.mainnet_faucet_claim) {
            return res.status(400).send({ data: { message: "Claim mainnet faucet before registering domain." } });
        }

        // Step 3
        const testnetUpdates = {};
        const mainnetUpdates = {};
        // check pre used twitter_id
        if (twitterUID) {

            const preUsed = await Test_Net.findOne({ "twitterId.twitterUID": twitterUID });
            if (preUsed) {
                return res.status(403).send({ data: { message: "This twitter_id has already used." } })
            }
        }
        // const preUsed = await Test_Net.findOne({ "twitterId.twitterUID": twitterUID });
        // if (preUsed) {
        //     return res.status(403).send({ message: "This twitter_id has already used." })
        // }

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
        // if (hashes !== undefined) testnetUpdates.hashes = hashes;
        if (hashes !== undefined) {
            if (!Array.isArray(hashes)) {
                return res.status(400).send({ data: { message: "`hashes` must be an array." } });
            }
            testnetUpdates.hashes = hashes;

            // If you want to merge instead of replacing:
            // testnetUpdates.hashes = [...new Set([...testNetData.hashes, ...hashes])];
        }

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
            if (GenerateMainnetAccessCode !== null) {
                const currentPoints = parseInt(user.points);
                const newPoint = currentPoints + 100;
                await User.findOneAndUpdate({ _id: userId }, { points: newPoint.toString() })
            }
            return res.status(200).send({
                data: {
                    success: true, message: "User details updated successfully.",
                    // data: req.user
                }
            });
        }

        if (Object.keys(mainnetUpdates).length > 0) {
            await Main_Net.updateOne({ user_id: userId }, { $set: mainnetUpdates });


            // const currentPoints = parseInt(user.points);
            // const newPoint = currentPoints + 10;
            const currentPoints = parseInt(user.points);
            let pointsToAdd = 1; // default point

            if (mainnetUpdates.bridge !== undefined && mainnetUpdates.bridge !== "") {
                pointsToAdd = 10; // award 10 points for bridge

                // ==>> find who reffer me to add 1 point
                const whorefferdMe = await User.findOne({ invide_code: req.user.referralId });
                // console.log("Who_refer_me : ", whorefferdMe);
                const currentPointsWhoRefferdMe = parseInt(whorefferdMe.points);
                let pointToAddWhoRefferdMe = 1;
                let finalPoint = currentPointsWhoRefferdMe + pointToAddWhoRefferdMe;

                // ```` (refferal_bridge_complition_points area) `````
                const currentPointsOfBridgeCompletion = parseInt(whorefferdMe.refferal_bridge_complition_points);
                let pointToAddInBridgeCompletion = 1;
                let finalPointOfBridgeCompletion = currentPointsOfBridgeCompletion + pointToAddInBridgeCompletion;
                const updatePointsWhoRefferdMe = await User.findOneAndUpdate({ _id: whorefferdMe._id }, { points: finalPoint.toString(), refferal_bridge_complition_points: finalPointOfBridgeCompletion });
                // ==>> find who reffer me area ends


            }

            const newPoint = currentPoints + pointsToAdd;
            await User.findOneAndUpdate({ _id: userId }, { points: newPoint.toString() })
            return res.status(200).send({
                data: {
                    success: true, message: "User details updated successfully.",
                    // data: req.user
                }
            });
        }

        return res.status(200).send({
            data: {
                message: "No info provided.",
            }
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

// refferals calculation
const referalCalculations = async (req, res) => {
    try {
        const loggedInUser = req.user;
        // console.log(loggedInUser);
        const totalRefferals = await User.aggregate([
            { $match: { referralId: loggedInUser.invide_code } },
            { $count: "total_refer_No" }
        ]);

        // who has completed mainNet
        const completedMainNetRefferals = await User.aggregate([
            { $match: { referralId: loggedInUser.invide_code } },
            {
                $lookup: {
                    from: "main_nets",
                    localField: "_id",
                    foreignField: "user_id",
                    as: "mainnetData"
                }
            },
            { $unwind: { path: "$mainnetData", preserveNullAndEmptyArrays: true } },
            { $match: { "mainnetData.RegisterKaanchDomain": { $ne: null } } },
            { $count: "complted_refer_no" }
        ]);
        const count = completedMainNetRefferals[0]?.complted_refer_no || 0;
        // const bridgeCompletionPoints = await
        return res.status(200).send({
            data: {
                status: true, message: "Calculated data fetched successfully.",
                result: {
                    total_refer_No: totalRefferals[0].total_refer_No,
                    complted_refer_no: count,
                    per_refer_point: parseInt(req.user.refferal_bridge_complition_points)
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Server error while calculating referal points.", error });
    }
}

module.exports = {
    refferedUser,
    userDetails,
    updateUserDetails,
    twitterAuth,
    topFiftyPointUsers,
    referalCalculations,
}