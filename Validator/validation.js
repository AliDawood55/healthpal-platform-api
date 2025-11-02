import Joi from 'joi';


export const counselingRequestSchema = Joi.object({
  topic: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Topic is required',
    'any.required': 'Topic is required',
  }),
  message: Joi.string().min(5).required().messages({
    'string.empty': 'Message is required',
    'any.required': 'Message is required',
  }),
  for_children: Joi.boolean().optional(),
  severity: Joi.string()
    .valid('mild', 'moderate', 'severe')
    .default('moderate'),
  preferred_mode: Joi.string()
    .valid('video', 'audio', 'chat')
    .default('chat'),
}).unknown(false);


export const supportGroupSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Group title is required',
  }),
  topic: Joi.string().min(3).max(255).required().messages({
    'string.empty': 'Topic is required',
  }),
  description: Joi.string().min(5).max(1000).optional(),
  is_private: Joi.boolean().default(false),
}).unknown(false);



export const supportGroupMessageSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Message cannot be empty',
  }),
}).unknown(false);



export const anonStartSchema = Joi.object({
  initial_message: Joi.string().allow('', null).optional(),
  for_children: Joi.boolean().optional(),
}).unknown(false);



export const anonMessageSchema = Joi.object({
  session_token: Joi.string().required().messages({
    'any.required': 'Session token is required',
  }),
  message: Joi.string().min(1).max(1000).required().messages({
    'string.empty': 'Message cannot be empty',
  }),
}).unknown(false);


export const roleSchema = Joi.string()
  .valid('patient', 'doctor', 'donor', 'ngo', 'admin')
  .required()
  .messages({
    'any.only':
      'Role must be one of: patient, doctor, donor, ngo, or admin',
  });


export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  role: roleSchema,
}).unknown(false);


export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
}).unknown(false);

const validateCounselorAssignment =  (req, res, next) => {
  req.body = req.body || {}; 
  req.body.counselorId = req.body.counselorId || req.user.id;
  next();
};

export { validateCounselorAssignment };
