import Joi from 'joi';

const createSessionSchema = Joi.object({
    appointment_id: Joi.number().integer().required(),
    mode: Joi.string().valid('video', 'audio', 'async').required(),
    signaling_url: Joi.string().uri().allow(null, ''),
    room_token: Joi.string().allow(null, '')
});

const createMessageSchema = Joi.object({
    appointment_id: Joi.number().integer().required(),
    sender_user_id: Joi.number().integer().required(),
    message: Joi.string().min(1).required(),
    attachment_url: Joi.string().uri().allow(null, ''),
    auto_translate: Joi.boolean().default(false),
    target_lang: Joi.string().valid('ar', 'en').default('en')
});

export const validateCreateSession = (req, res, next) => {
    const { error, value } = createSessionSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res
            .status(422)
            .json({ errors: error.details.map(d => d.message) });
    }
    req.body = value;
    next();
};

export const validateCreateMessage = (req, res, next) => {
    const { error, value } = createMessageSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res
            .status(422)
            .json({ errors: error.details.map(d => d.message) });
    }
    req.body = value;
    next();
};

export default {
    validateCreateSession,
    validateCreateMessage
};
