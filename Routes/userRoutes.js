const { refferedUser, updateUserDetails, userDetails } = require("../Controllers/userController.js");

const express = require("express");
const { validateRequest, updateUserValidation } = require("../Validations/userValidation.js");
const { Authentication } = require("../Middlewares/userAuth.js");
const router = express.Router();

router.post("/refferal", refferedUser);
router.get("/user-details", Authentication, userDetails);
router.put("/update-user-info", validateRequest(updateUserValidation), updateUserDetails)


module.exports = router