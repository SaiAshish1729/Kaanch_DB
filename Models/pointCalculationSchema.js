const mongoose = require("mongoose");

const pointCalculationSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    twitter_point: {
        type: Number,
        default: 0
    },
    retweet_point: {
        type: Number,
        default: 0
    },
    join_group_point: {
        type: Number,
        default: 0
    },
    bridge_point: {
        type: Number,
        default: 0
    },
    check_holding_point: {
        type: Number,
        default: 0
    },
    RegisterKaanchDomain_point: {
        type: Number,
        default: 0
    },
    per_refferal_point: {
        type: Number,
        default: 0
    },

});

const Point_Calculation = new mongoose.model("Point_Calculation", pointCalculationSchema);

module.exports = Point_Calculation     