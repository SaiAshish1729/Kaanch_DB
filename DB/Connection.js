const mongoose = require("mongoose");

const Connection = async () => {
    // const URL = "mongodb://127.0.0.1:27017/Kaanch_DB"
    // const URL = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.iicjf2c.mongodb.net/Kaanch-DB`

    try {
        await mongoose.connect(
            // URL
            process.env.URL,
            // { useNewUrlParser: true }
        )
        console.log("Database Connected Successfully!");
    } catch (error) {
        console.log("Error whine Connection", error)
    }
}
module.exports = Connection