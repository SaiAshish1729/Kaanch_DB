const mongoose = require("mongoose");

const Connection = async () => {
    // const URL = "mongodb://127.0.0.1:27017/Kaanch_DB"
    // const URL = "mongodb+srv://shawashis500:UVvhNO6yETkAOwFx@cluster0.mongodb.net/Kaanch-DB?retryWrites=true&w=majority";
    const URL = "mongodb+srv://sanjidarahman:bAUGAmae8PsiXoVC@cluster0.iicjf2c.mongodb.net/Kaanch-DB"


    try {
        await mongoose.connect(URL, { useNewUrlParser: true })
        console.log("Database Connected Successfully!");
    } catch (error) {
        console.log("Error whine Connection", error)
    }
}
module.exports = Connection