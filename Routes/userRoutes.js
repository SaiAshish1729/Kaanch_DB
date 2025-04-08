const { refferedUser, updateUserDetails, userDetails, twitterAuth } = require("../Controllers/userController.js");

const express = require("express");
const { validateRequest, updateUserValidation } = require("../Validations/userValidation.js");
const { Authentication } = require("../Middlewares/userAuth.js");
const router = express.Router();

router.post("/refferal", refferedUser);
router.get("/user-details", Authentication, userDetails);
router.get("/auth/twitter/callback", twitterAuth)
router.put("/update-user-info", Authentication,
    // validateRequest(updateUserValidation),
    updateUserDetails);


module.exports = router