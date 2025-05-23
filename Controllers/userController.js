const User = require("../Models/userSchema");
const { generateJWTtoken, twitterOauthTokenParams, BasicAuthToken, generateCode } = require("../utility");
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
                // console.log(referralId)
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
        return res.status(500).send({ status: false, message: "Error occured while sign in by referal_Id.", error });
    }
}

// fetch user details
const userDetails = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) {
            return res.status(400).send({ data: { status: false, message: "Address is missing." } });
        } else {
            const user = req.customizedUser;
            if (user.address !== address) {
                return res.status(403).send({ data: { status: false, message: "This address is not authentic with the provided token." } });
            }
            return res.status(200).send({ data: { status: true, message: "User details fetched successfully.", result: user } });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ data: { status: false, message: "Server error while fetching user details.", error } });
    }
}

// twitter auth
const twitterAuth = async (req, res) => {
    try {
        const { code } = req.query;
        // console.log("Code : ", code);
        // console.log("twitterOauthTokenParams", twitterOauthTokenParams)

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
        // console.log("data2", data2);
        res.status(200).send({
            data: data2,
            status: true
        })
    } catch (error) {
        console.error('Error while twitter auth:', error);
        res.status(500).send({ message: 'Error while twitter auth', error });
    }
}


// const updateUserDetails = async (req, res) => {
//     try {
//         const user = req.user;
//         // console.log("logged_in_user : ", req.user);
//         if (user === undefined) {
//             return res.status(404).send({ data: { status: false, message: "User not found with provided token." } })
//         }
//         const { address } = req.query;
//         if (!address) {
//             return res.status(403).send({ data: { status: false, message: "Address is missing." } })
//         }
//         if (address !== req.user.address) {
//             return res.status(403).send({ data: { status: false, message: "Provided address is not matched with the token." } })
//         }
//         const userId = user._id.toString();
//         const {
//             // testNet data
//             twitterUID, displayName, photoURL,
//             followKnchOnX, Dispathch_Wallet, Join_Group, testnet_faucet_claim, hashes, GenerateMainnetAccessCode,
//             // mainNet data
//             bridge, mainnet_faucet_claim, RegisterKaanchDomain } = req.body;

//         const testNetData = await Test_Net.findOne({ user_id: userId });
//         // console.log("testNet : ", testNetData);
//         const mainNetData = await Main_Net.findOne({ user_id: userId });

//         if (!testNetData || !mainNetData) {
//             return res.status(404).send({ data: { status: false, message: "User's testnet or mainnet data not found" } });
//         }

//         if (followKnchOnX && testNetData.twitterId.twitterUID === null) {
//             return res.status(400).send({ data: { status: false, message: "Please connect X before following us." } });
//         }

//         if (Dispathch_Wallet && !testNetData.followKnchOnX) {
//             return res.status(400).send({ data: { status: false, message: "Please follow on followKnchOnX before updating Dispatch Wallet." } });
//         }

//         if (Join_Group && !testNetData.Dispathch_Wallet) {
//             return res.status(400).send({ data: { status: false, message: "Please complete Dispatch Wallet before joining group." } });
//         }

//         if (testnet_faucet_claim && !testNetData.Join_Group) {
//             return res.status(400).send({ data: { status: false, message: "Join the group before claiming testnet faucet." } });
//         }

//         if (GenerateMainnetAccessCode && !testNetData.testnet_faucet_claim) {
//             return res.status(400).send({ data: { status: false, message: "Claim the testnet faucet before generating mainnet access code." } });
//         }

//         // mainNet checkinngs ...
//         if (mainnet_faucet_claim && !mainNetData.bridge) {
//             return res.status(400).send({ data: { status: false, message: "Bridge is required before claiming mainnet faucet." } });
//         }

//         if (RegisterKaanchDomain && !mainNetData.mainnet_faucet_claim) {
//             return res.status(400).send({ data: { status: false, message: "Claim mainnet faucet before registering domain." } });
//         }

//         // Step 3
//         const testnetUpdates = {};
//         const mainnetUpdates = {};
//         const alreadyUpdatedFields = [];
//         // check pre used twitter_id
//         if (twitterUID) {
//             const preUsed = await Test_Net.findOne({ "twitterId.twitterUID": twitterUID });
//             if (preUsed) {
//                 return res.status(403).send({ data: { status: false, message: "This twitter_id has already used." } })
//             }
//         }

//         if (twitterUID || displayName || photoURL) {
//             const currentTwitter = testNetData.twitterId || {};
//             // console.log(currentTwitter) 
//             if (!currentTwitter.twitterUID && twitterUID) {
//                 testnetUpdates["twitterId"] = {
//                     twitterUID,
//                     displayName: displayName ?? currentTwitter.displayName,
//                     photoURL: photoURL ?? currentTwitter.photoURL,
//                 };
//             } else {
//                 alreadyUpdatedFields.push("twitterUID");
//                 return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } })
//             }
//         }

//         if (followKnchOnX !== undefined) {
//             if (!testNetData.followKnchOnX) {
//                 testnetUpdates.followKnchOnX = followKnchOnX;
//             } else {
//                 alreadyUpdatedFields.push("followKnchOnX");
//                 return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } })
//             }
//         }
//         if (Dispathch_Wallet !== undefined) {
//             if (!testNetData.Dispathch_Wallet) {
//                 testnetUpdates.Dispathch_Wallet = Dispathch_Wallet;
//             } else {
//                 alreadyUpdatedFields.push("Dispathch_Wallet");
//                 return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } })
//             }
//         }
//         if (Join_Group !== undefined) {
//             if (!testNetData.Join_Group) {
//                 testnetUpdates.Join_Group = Join_Group;
//             } else {
//                 alreadyUpdatedFields.push("Join_Group");
//                 return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } })
//             }
//         }
//         if (testnet_faucet_claim !== undefined) {
//             if (!testNetData.testnet_faucet_claim) {
//                 testnetUpdates.testnet_faucet_claim = testnet_faucet_claim;
//             } else {
//                 alreadyUpdatedFields.push("testnet_faucet_claim");
//                 return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } })
//             }
//         }
//         if (GenerateMainnetAccessCode !== undefined) {
//             if (!testNetData.GenerateMainnetAccessCode) {
//                 testnetUpdates.GenerateMainnetAccessCode = GenerateMainnetAccessCode;
//             } else {
//                 alreadyUpdatedFields.push("GenerateMainnetAccessCode");
//                 return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } })
//             }
//         }

//         // if (hashes !== undefined) testnetUpdates.hashes = hashes;
//         if (hashes !== undefined) {
//             if (!Array.isArray(hashes)) {
//                 return res.status(400).send({ data: { status: false, message: "`hashes` must be an array." } });
//             }

//             const existingHashes = Array.isArray(testNetData.hashes) ? testNetData.hashes : [];
//             testnetUpdates.hashes = [...new Set([...existingHashes, ...hashes])];
//         }


//         if (GenerateMainnetAccessCode !== undefined) testnetUpdates.GenerateMainnetAccessCode = GenerateMainnetAccessCode;

//         // if (bridge !== undefined) mainnetUpdates.bridge = bridge;
//         if (bridge !== undefined) {
//             if (!Array.isArray(bridge)) {
//                 return res.status(400).send({ status: false, message: "`bridge` must be an array." });
//             }
//             const existingBridge = Array.isArray(mainNetData.bridge) ? mainNetData.bridge : [];
//             // console.log("existingBridge : ", existingBridge)
//             let newBridge = mainnetUpdates.bridge = [...new Set([...existingBridge, ...bridge])];
//             // console.log("new_bridge : ", newBridge)
//         }


//         if (mainnet_faucet_claim !== undefined) {
//             if (!mainNetData.mainnet_faucet_claim) {
//                 mainnetUpdates.mainnet_faucet_claim = mainnet_faucet_claim;
//             } else {
//                 alreadyUpdatedFields.push("mainnet_faucet_claim");
//                 return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
//             }
//         }
//         if (RegisterKaanchDomain !== undefined) {
//             if (!mainNetData.RegisterKaanchDomain) {
//                 mainnetUpdates.RegisterKaanchDomain = RegisterKaanchDomain;
//             } else {
//                 alreadyUpdatedFields.push("RegisterKaanchDomain");
//                 return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
//             }
//         }

//         // Step 4
//         // console.log(testnetUpdates)
//         // console.log(mainnetUpdates);

//         if (Object.keys(testnetUpdates).length > 0) {
//             await Test_Net.updateOne({ user_id: userId }, { $set: testnetUpdates });
//             if (GenerateMainnetAccessCode) {
//                 const currentPoints = parseInt(user.points);
//                 const newPoint = currentPoints + 100;
//                 await User.findOneAndUpdate({ _id: userId }, { points: newPoint.toString() })
//             }
//             return res.status(200).send({
//                 data: {
//                     status: true, message: "User details updated successfully.",
//                     // data: req.user
//                 }
//             });
//         }

//         if (Object.keys(mainnetUpdates).length > 0) {
//             await Main_Net.updateOne({ user_id: userId }, { $set: mainnetUpdates });
//             // console.log("curVal : ", user.mainnetData.bridge.length);

//             const currentPoints = parseInt(user.points);
//             let pointsToAdd = 0; // default point

//             if (mainnetUpdates.bridge !== undefined && mainnetUpdates.bridge !== "") {

//                 if (user.mainnetData.bridge.length < 1) {
//                     pointsToAdd = 10;

//                     // ==>> find who reffer me to add 1 point
//                     const whorefferdMe = await User.findOne({ invide_code: req.user.referralId });
//                     // console.log("Who_refer_me : ", whorefferdMe);
//                     const currentPointsWhoRefferdMe = parseInt(whorefferdMe.points);
//                     let pointToAddWhoRefferdMe = 1;
//                     let finalPoint = currentPointsWhoRefferdMe + pointToAddWhoRefferdMe;

//                     // ```` (refferal_bridge_complition_points area --due to I have added a special key in DB) `````
//                     const currentPointsOfBridgeCompletion = parseInt(whorefferdMe.refferal_bridge_complition_points);
//                     let pointToAddInBridgeCompletion = 1;
//                     let finalPointOfBridgeCompletion = currentPointsOfBridgeCompletion + pointToAddInBridgeCompletion;
//                     const updatePointsWhoRefferdMe = await User.findOneAndUpdate({ _id: whorefferdMe._id }, { points: finalPoint.toString(), refferal_bridge_complition_points: finalPointOfBridgeCompletion });
//                     // ==>> find who reffer me area ends
//                 }

//             }

//             // === Mainnet Faucet Claim Logic ===
//             if (mainnetUpdates.mainnet_faucet_claim && !user.mainnetData.mainnet_faucet_claim) {
//                 pointsToAdd += 1;
//             }

//             // === Register Kaanch Domain Logic ===
//             if (mainnetUpdates.RegisterKaanchDomain && !user.mainnetData.RegisterKaanchDomain) {
//                 pointsToAdd += 1;

//                 // // ==>> find who reffer me to add 1 point
//                 // const whorefferdMe = await User.findOne({ invide_code: req.user.referralId });
//                 // // console.log("Who_refer_me : ", whorefferdMe);
//                 // const currentPointsWhoRefferdMe = parseInt(whorefferdMe.points);
//                 // let pointToAddWhoRefferdMe = 1;
//                 // let finalPoint = currentPointsWhoRefferdMe + pointToAddWhoRefferdMe;

//                 // // ````` ( point add to refferal_mainnet_completed_points colmn also ) ````````
//                 // const current_refferal_mainnet_completed_points = parseInt(whorefferdMe.refferal_mainnet_completed_points);
//                 // let pointToAddIn_refferal_mainnet_completed_points = 1;
//                 // let finalPointOf_mainnet_Completion = current_refferal_mainnet_completed_points + pointToAddIn_refferal_mainnet_completed_points;
//                 // const updatePointsWhoRefferdMe = await User.findOneAndUpdate({ _id: whorefferdMe._id }, { points: finalPoint.toString(), refferal_mainnet_completed_points: finalPointOf_mainnet_Completion });

//             }

//             const newPoint = currentPoints + pointsToAdd;
//             await User.findOneAndUpdate({ _id: userId }, { points: newPoint.toString() })
//             return res.status(200).send({
//                 data: {
//                     status: true, message: "User details updated successfully.",
//                     // data: req.user
//                 }
//             });
//         }

//         return res.status(200).send({
//             data: {
//                 status: false,
//                 message: "No info provided.",
//             }
//         });
//     } catch (error) {
//         console.log(error);
//         return res.status(500).send({ data: { status: false, message: "Server error while updating user details.", error } });
//     }
// }

// ===>>
const updateUserDetails = async (req, res) => {
    try {
        const user = req.user;
        if (user === undefined) {
            return res.status(404).send({ data: { status: false, message: "User not found with provided token." } });
        }

        const { address } = req.query;
        if (!address) {
            return res.status(403).send({ data: { status: false, message: "Address is missing." } });
        }

        if (address !== req.user.address) {
            return res.status(403).send({ data: { status: false, message: "Provided address is not matched with the token." } });
        }

        const userId = user._id.toString();
        const {
            twitterUID, displayName, photoURL,
            followKnchOnX, Dispathch_Wallet, Join_Group, testnet_faucet_claim, hashes,
            bridge, mainnet_faucet_claim, RegisterKaanchDomain
        } = req.body;

        const testNetData = await Test_Net.findOne({ user_id: userId });
        const mainNetData = await Main_Net.findOne({ user_id: userId });

        if (!testNetData || !mainNetData) {
            return res.status(404).send({ data: { status: false, message: "User's testnet or mainnet data not found" } });
        }

        if (followKnchOnX && testNetData.twitterId.twitterUID === null) {
            return res.status(400).send({ data: { status: false, message: "Please connect X before following us." } });
        }

        if (Dispathch_Wallet && !testNetData.followKnchOnX) {
            return res.status(400).send({ data: { status: false, message: "Please follow on followKnchOnX before updating Dispatch Wallet." } });
        }

        if (Join_Group && !testNetData.Dispathch_Wallet) {
            return res.status(400).send({ data: { status: false, message: "Please complete Dispatch Wallet before joining group." } });
        }

        if (testnet_faucet_claim && !testNetData.Join_Group) {
            return res.status(400).send({ data: { status: false, message: "Join the group before claiming testnet faucet." } });
        }

        if (mainnet_faucet_claim && !mainNetData.bridge) {
            return res.status(400).send({ data: { status: false, message: "Bridge is required before claiming mainnet faucet." } });
        }

        if (RegisterKaanchDomain && !mainNetData.mainnet_faucet_claim) {
            return res.status(400).send({ data: { status: false, message: "Claim mainnet faucet before registering domain." } });
        }

        const testnetUpdates = {};
        const mainnetUpdates = {};
        const alreadyUpdatedFields = [];

        if (twitterUID) {
            const preUsed = await Test_Net.findOne({ "twitterId.twitterUID": twitterUID });
            if (preUsed) {
                return res.status(403).send({ data: { status: false, message: "This twitter_id has already used." } });
            }
        }

        if (twitterUID || displayName || photoURL) {
            const currentTwitter = testNetData.twitterId || {};
            if (!currentTwitter.twitterUID && twitterUID) {
                testnetUpdates["twitterId"] = {
                    twitterUID,
                    displayName: displayName ?? currentTwitter.displayName,
                    photoURL: photoURL ?? currentTwitter.photoURL,
                };
            } else {
                alreadyUpdatedFields.push("twitterUID");
                return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
            }
        }

        if (followKnchOnX !== undefined) {
            if (!testNetData.followKnchOnX) {
                testnetUpdates.followKnchOnX = followKnchOnX;
            } else {
                alreadyUpdatedFields.push("followKnchOnX");
                return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
            }
        }

        if (Dispathch_Wallet !== undefined) {
            if (!testNetData.Dispathch_Wallet) {
                testnetUpdates.Dispathch_Wallet = Dispathch_Wallet;
            } else {
                alreadyUpdatedFields.push("Dispathch_Wallet");
                return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
            }
        }

        if (Join_Group !== undefined) {
            if (!testNetData.Join_Group) {
                testnetUpdates.Join_Group = Join_Group;
            } else {
                alreadyUpdatedFields.push("Join_Group");
                return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
            }
        }

        if (testnet_faucet_claim !== undefined) {
            if (!testNetData.testnet_faucet_claim) {
                testnetUpdates.testnet_faucet_claim = testnet_faucet_claim;
            } else {
                alreadyUpdatedFields.push("testnet_faucet_claim");
                return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
            }
        }

        let addHashPoints = false;

        if (hashes !== undefined) {
            if (!Array.isArray(hashes)) {
                return res.status(400).send({ data: { status: false, message: "`hashes` must be an array." } });
            }

            const existingHashes = Array.isArray(testNetData.hashes) ? testNetData.hashes : [];
            const mergedHashes = [...new Set([...existingHashes, ...hashes])];

            if (existingHashes.length === 0 && hashes.length > 0) {
                addHashPoints = true; // Only first time
            }

            testnetUpdates.hashes = mergedHashes;
        }

        if (bridge !== undefined) {
            if (!Array.isArray(bridge)) {
                return res.status(400).send({ status: false, message: "`bridge` must be an array." });
            }
            const existingBridge = Array.isArray(mainNetData.bridge) ? mainNetData.bridge : [];
            mainnetUpdates.bridge = [...new Set([...existingBridge, ...bridge])];
        }

        if (mainnet_faucet_claim !== undefined) {
            if (!mainNetData.mainnet_faucet_claim) {
                mainnetUpdates.mainnet_faucet_claim = mainnet_faucet_claim;
            } else {
                alreadyUpdatedFields.push("mainnet_faucet_claim");
                return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
            }
        }

        if (RegisterKaanchDomain !== undefined) {
            if (!mainNetData.RegisterKaanchDomain) {
                mainnetUpdates.RegisterKaanchDomain = RegisterKaanchDomain;
            } else {
                alreadyUpdatedFields.push("RegisterKaanchDomain");
                return res.status(403).send({ data: { status: false, message: `You have already updated ${alreadyUpdatedFields[0]}.` } });
            }
        }

        if (Object.keys(testnetUpdates).length > 0) {
            await Test_Net.updateOne({ user_id: userId }, { $set: testnetUpdates });

            if (addHashPoints) {
                const currentPoints = parseInt(user.points);
                const newPoint = currentPoints + 100;
                await User.findOneAndUpdate({ _id: userId }, { points: newPoint.toString() });
            }

            return res.status(200).send({
                data: {
                    status: true,
                    message: "User details updated successfully.",
                }
            });
        }

        if (Object.keys(mainnetUpdates).length > 0) {
            await Main_Net.updateOne({ user_id: userId }, { $set: mainnetUpdates });

            const currentPoints = parseInt(user.points);
            let pointsToAdd = 0;

            if (mainnetUpdates.bridge !== undefined && mainnetUpdates.bridge !== "") {
                if (user.mainnetData.bridge.length < 1) {
                    pointsToAdd = 10;

                    const whorefferdMe = await User.findOne({ invide_code: req.user.referralId });
                    if (whorefferdMe) {
                        const currentPointsWhoRefferdMe = parseInt(whorefferdMe.points);
                        const bridgePoints = parseInt(whorefferdMe.refferal_bridge_complition_points);
                        await User.findOneAndUpdate(
                            { _id: whorefferdMe._id },
                            {
                                points: (currentPointsWhoRefferdMe + 1).toString(),
                                refferal_bridge_complition_points: bridgePoints + 1,
                            }
                        );
                    }
                }
            }

            if (mainnetUpdates.mainnet_faucet_claim && !user.mainnetData.mainnet_faucet_claim) {
                pointsToAdd += 1;
            }

            if (mainnetUpdates.RegisterKaanchDomain && !user.mainnetData.RegisterKaanchDomain) {
                pointsToAdd += 1;
            }

            const newPoint = currentPoints + pointsToAdd;
            await User.findOneAndUpdate({ _id: userId }, { points: newPoint.toString() });

            return res.status(200).send({
                data: {
                    status: true,
                    message: "User details updated successfully.",
                }
            });
        }

        return res.status(200).send({
            data: {
                status: false,
                message: "No info provided.",
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ data: { status: false, message: "Server error while updating user details.", error } });
    }
};



// top 50 highest point users
const topFiftyPointUsers = async (req, res) => {
    try {
        const topUsers = await User.aggregate([
            {
                $match: {
                    address: { $ne: process.env.ADMIN_ADDRESS } // Exclude address "Admin"
                }
            },
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
            data: {
                status: true,
                message: "Top 50 users fetched successfully.",
                result: topUsers
            }
        });

    } catch (error) {
        console.error("Error fetching top users:", error);
        return res.status(500).send({ data: { status: false, message: "Server error while fetching top users.", error } });
    }
};

// refferals calculation
const referalCalculations = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { address } = req.query;
        if (!address) {
            return res.status(400).send({ data: { status: false, message: "Address is missing." } })
        }
        if (address !== req.user.address) {
            return res.status(403).send({ data: { status: false, message: "Provided address is not matched with the token." } });
        }

        let totalRefferals = [];
        if (loggedInUser.invide_code !== null) {
            totalRefferals = await User.aggregate([
                { $match: { referralId: loggedInUser.invide_code } },
                { $count: "total_refer_No" }
            ]);
        }

        // const totalRefferals = await User.aggregate([
        //     { $match: { referralId: loggedInUser.invide_code } },
        //     { $count: "total_refer_No" }
        // ]);

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
                    total_refer_No: totalRefferals[0]?.total_refer_No || 0,
                    complted_refer_no: count,
                    per_refer_point: parseInt(req.user.refferal_bridge_complition_points)
                }
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ data: { status: false, message: "Server error while calculating referal points.", error } });
    }
}

// invite_code generator
const generateInviteCodeForMyAccount = async (req, res) => {
    try {
        const { invide_code } = req.body;
        const loggedInUser = req.user;
        const { address } = req.query;
        if (!address) {
            return res.status(400).send({ data: { status: false, message: "Address is missing." } })
        }
        if (address !== req.user.address) {
            return res.status(403).send({ data: { status: false, message: "Provided address is not matched with the token." } });
        }

        if (loggedInUser.invide_code) {
            return res.status(403).send({ data: { status: false, message: "You already have a invite code." } })
        }

        const code = generateCode();
        const savedCode = await User.updateOne({ _id: loggedInUser._id }, { $set: { invide_code: code } });

        return res.status(200).send({
            data: {
                status: true,
                message: "Invite code saved successfully.",
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ data: { status: false, message: "Server error while generating invite code.", error } });
    }
}

module.exports = {
    refferedUser,
    userDetails,
    updateUserDetails,
    twitterAuth,
    topFiftyPointUsers,
    referalCalculations,
    generateInviteCodeForMyAccount,

}