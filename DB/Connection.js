const mongoose = require("mongoose");
const URL = "mongodb://127.0.0.1:27017/Kaanch_DB"

const MONGO_URL = process.env.URL
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
const Connection = async () => {
    if (cached.conn) {
        return cached.conn; // Use existing connection
    }
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URL);
    }
    try {
        cached.conn = await cached.promise;
        console.log("Database Connected Successfully ✅");
        return cached.conn;
    } catch (error) {
        console.log("Error whine Connection", error)
        throw error;
    }
}
module.exports = Connection