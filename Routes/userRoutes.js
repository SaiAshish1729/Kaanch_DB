const { refferedUser, updateUserDetails, userDetails, twitterAuth, topFiftyPointUsers, referalCalculations } = require("../Controllers/userController.js");

const express = require("express");
const { validateRequest, updateUserValidation } = require("../Validations/userValidation.js");
const { Authentication } = require("../Middlewares/userAuth.js");
const router = express.Router();

router.post("/referral", refferedUser);
router.get("/user-details", Authentication, userDetails);
router.get("/auth/twitter/callback", twitterAuth)
router.put("/update-user-info", Authentication,
    // validateRequest(updateUserValidation),
    updateUserDetails);
router.get("/top-fifty-users-list", topFiftyPointUsers);
router.get("/get-refferal-calculation", Authentication, referalCalculations)


module.exports = router