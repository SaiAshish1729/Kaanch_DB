const mongoose = require("mongoose");

const mainNetSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    bridge: {
        type: String,
        default: false
    },
    mainnet_faucet_claim: {
        type: Boolean,
        default: false
    },
    RegisterKaanchDomain: {
        type: String,
        default: false
    },

});

const Main_Net = new mongoose.model("Main_Net", mainNetSchema);

module.exports = Main_Net