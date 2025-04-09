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
    invide_code: {
        type: String,
        default: null
    },
    points: {
        type: String,
        default: "0"
    },
    refferal_bridge_complition_points: {
        type: String,
        default: "0"
    }
});

const User = new mongoose.model("User", userSchema);

module.exports = User