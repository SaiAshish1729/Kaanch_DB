const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    jwtToken: {
        type: String
    },
    referralId: {
        type: String
    },
    address: {
        type: String
    },
    twitterId: {
        twitterUID: { type: String, default: null },
        displayName: { type: String, default: null },
        photoURL: { type: String, default: null },
    },

    followKnchOnX: {
        type: String,
        default: false
    },
    Dispathch_Wallet: {
        type: String,
        default: false
    },
    Join_Group: {
        type: String,
        default: false
    },
    Join_Channel: {
        type: String,
        default: false
    },
    testnet_faucet_claim: {
        type: String,
        default: false
    },  // Balance check faucet claim testnet
    hashes: {
        type: String,
        default: false
    },
    GenerateMainnetAccessCode: {
        type: String,
        default: false
    },
    enterMainnetAccessCode: {
        type: String,
        default: false
    },
    bridge: {
        type: String,
        default: false
    },
    mainnet_faucet_claim: {
        type: String,
        default: false
    },
    RegisterKaanchDomain: {
        type: String,
        default: false
    },
    invide_code: {
        type: String,
        default: false
    },
    Referral_Number: {
        type: String,
        default: 0
    },
    points: {
        type: String,
        default: 0
    }
});

const User = new mongoose.model("User", userSchema);

module.exports = User