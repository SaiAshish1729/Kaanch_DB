const mongoose = require("mongoose");

const testNetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    twitterId: {
        twitterUID: { type: String, default: null },
        displayName: { type: String, default: null },
        photoURL: { type: String, default: null },
    },

    followKnchOnX: {
        type: Boolean,
        default: false
    },
    Dispathch_Wallet: {
        type: Boolean,
        default: false
    },
    Join_Group: {
        type: Boolean,
        default: false
    },

    testnet_faucet_claim: {
        type: Boolean,
        default: false
    },  // Balance check faucet claim testnet

    // hashes: {
    //     type: String,
    //     default: null
    // },
    hashes: {
        type: String,
        default: null
    },
    GenerateMainnetAccessCode: {
        type: String,
        default: null
    },

});

const Test_Net = new mongoose.model("Test_Net", testNetSchema);

module.exports = Test_Net