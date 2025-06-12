const mongoose = require("mongoose");
require("dotenv").config({ path: `${process.cwd()}/.env` });
const User = require("../Models/userSchema");
const Connection = require("../DB/Connection");
const Test_Net = require("../Models/testNetSchema");
const Main_Net = require("../Models/mainNetSchema");
const Point_Calculation = require("../Models/pointCalculationSchema");

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

        // additional 
        const testNet = new Test_Net({
            user_id: adminData._id
        })
        await testNet.save();
        const mainNet = new Main_Net({
            user_id: adminData._id
        });
        await mainNet.save();
        const pointCalculationRecord = new Point_Calculation({
            user_id: adminData._id
        });
        await pointCalculationRecord.save();
        console.log("Admin seeded successfuly !");
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

seedAdmin();
module.exports = seedAdmin