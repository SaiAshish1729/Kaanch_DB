const mongoose = require("mongoose");
require("dotenv").config({ path: `${process.cwd()}/.env` });
const User = require("../Models/userSchema");
const Connection = require("../DB/Connection");
// const dataSet = require("")

const bulkDataSeeder = async () => {
    try {
        await Connection();
        // check the doc first ...
        // const existingData = Object.keys(dataSet);

    } catch (error) {
        console.log(error);
    }
}

module.exports = bulkDataSeeder