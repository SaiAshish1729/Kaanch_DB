const User = require("../Models/userSchema");
const { generateJWTtoken } = require("../utility");
const ethers = require("ethers")

const refferedUser = async (req, res) => {
    try {
        const { referralId, address } = req.query;

        

        if (!address) {
            return res.status(400).json({ data: { status: false, message: "Address is missing" } });
        }
        if(ethers.utils.isAddress(address)){
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
        }else{
            return res.status(200).send({data:{status:false, message:"Invalid address."}})
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
            { jwtToken: token }, // Find user by token
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
}