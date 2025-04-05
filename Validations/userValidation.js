const Joi = require('joi');

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false, convert: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        next();
    };
};

const updateUserValidation = Joi.object({
    followKnchOnX: Joi.string().required().label("followKnchOnX"),
    Dispathch_Wallet: Joi.string().required().label("Dispathch_Wallet"),
    Join_Group: Joi.string().required().label("Join_Group"),
    Join_Channel: Joi.string().required().label("Join_Channel"),
    testnet_faucet_claim: Joi.string().required().label("testnet_faucet_claim"),
    hashes: Joi.string().required().label("hashes"),
    GenerateMainnetAccessCode: Joi.string().required().label("GenerateMainnetAccessCode"),
    enterMainnetAccessCode: Joi.string().required().label("enterMainnetAccessCode"),
    bridge: Joi.string().required().label("bridge"),
    mainnet_faucet_claim: Joi.string().required().label("mainnet_faucet_claim"),
    RegisterKaanchDomain: Joi.string().required().label("RegisterKaanchDomain"),
    invide_code: Joi.string().required().label("invide_code"),
    Referral_Number: Joi.string().required().label("Referral_Number"),
    points: Joi.string().required().label("points"),
});

module.exports = {
    validateRequest,
    updateUserValidation,
}