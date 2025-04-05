const mongoose = require("mongoose");

const Connection = async () => {
    const URL = "mongodb://127.0.0.1:27017/Kaanch_DB"
    try {
        await mongoose.connect(URL, { useNewUrlParser: true })
        console.log("Database Connected Successfully!");
    } catch (error) {
        console.log("Error whine Connection", error)
    }
}
module.exports = Connection