const mongoose = require("mongoose");

const mainNetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bridge: {
        type: [Object],
        default: []
    },
    // mainnet_faucet_claim: {
    //     type: Boolean,
    //     default: false
    // },
    RegisterKaanchDomain: {
        type: [Object],
        default: []
    },

    // buy_kaanch_now: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    check_holding: {
        type: [Object],
        default: []
    }

});

const Main_Net = new mongoose.model("Main_Net", mainNetSchema);

module.exports = Main_Net                   