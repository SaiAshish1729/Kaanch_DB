// const dotenv = require("dotenv");
require('dotenv').config({ path: `${process.cwd()}/.env` });
const express = require("express");
const cors = require("cors");
const Connection = require("./DB/Connection.js");
const app = express();
const userRoute = require("./Routes/userRoutes.js")

// dotenv.config();
const port = process.env.APP_PORT || 5000;
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// DB Connection
Connection();
//Routes
app.use("/api/v1/user", userRoute);

app.get("/", (req, res) => {
    res.send("Hello world!");
});
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
    console.log(`Listning on port http://localhost:${port}`);
})