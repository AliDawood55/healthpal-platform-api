const Joi = require('joi');

const userSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid('patient','doctor','donor','ngo','admin').required()
});

exports.validateCreateUser = (req, res, next) => {
    const { error, value } = userSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(422).json({ errors: error.details.map(d => d.message) });
    req.body = value;
    next();
};
