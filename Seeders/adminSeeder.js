const mongoose = require("mongoose");
require("dotenv").config({ path: `${process.cwd()}/.env` });
const User = require("../Models/userSchema");
const Connection = require("../DB/Connection");

const seedAdmin = async () => {
    try {
        await Connection();
        const adminExists = await User.findOne({ address: process.env.ADMIN_ADDRESS });
        if (adminExists) {
            return console.log("Admin already exists.")
        }
        const adminData = await User({
            address: process.env.ADMIN_ADDRESS,
            invide_code: process.env.ADMIN_INVITE_CODE,
        });
        await adminData.save();
        console.log("Admin seeded successfuly !");
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}
seedAdmin();
module.exports = seedAdmin