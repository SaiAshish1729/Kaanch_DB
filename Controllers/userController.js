const User = require("../Models/userSchema");
const { generateJWTtoken, twitterOauthTokenParams, BasicAuthToken } = require("../utility");
const ethers = require("ethers")
const axios = require("axios");

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
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required." });
        }
        const user = await User.findOne({ jwtToken: token });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        const { followKnchOnX, Dispathch_Wallet, Join_Group, Join_Channel, testnet_faucet_claim, hashes, GenerateMainnetAccessCode, enterMainnetAccessCode, bridge, mainnet_faucet_claim, RegisterKaanchDomain, invide_code, Referral_Number, points } = req.body;

        const updatedInfo = await User.findOneAndUpdate(
            { jwtToken: token },
            {
                $set: {
                    followKnchOnX,
                    Dispathch_Wallet,
                    Join_Group,
                    Join_Channel,
                    testnet_faucet_claim,
                    hashes,
                    GenerateMainnetAccessCode,
                    enterMainnetAccessCode,
                    bridge,
                    mainnet_faucet_claim,
                    RegisterKaanchDomain,
                    invide_code,
                    Referral_Number,
                    points
                }
            },
            { new: true }
        );
        return res.status(200).send({ success: true, message: "User details updated successfully.", data: updatedInfo });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Server error while updating user details.", error });
    }
}

module.exports = {
    refferedUser,
    userDetails,
    updateUserDetails,
    twitterAuth,
}