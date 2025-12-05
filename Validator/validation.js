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


export const requestSchema = Joi.object({
  notes: Joi.string().max(1000).optional(),
}).unknown(false);

export const ngoSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'NGO name is required',
  }),
}).unknown(false);

export const missionSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  specialty: Joi.string().min(2).max(255).required(),
  location: Joi.string().min(2).max(255).required(),
  start_date: Joi.string().isoDate().required(),
  end_date: Joi.string().isoDate().required(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
  organizer_ngo_id: Joi.number().integer().optional(),
  description: Joi.string().max(2000).optional(),
  is_published: Joi.boolean().optional(),
}).unknown(false);

export const availabilitySchema = Joi.object({
  start_at: Joi.string().isoDate().required(),
  end_at: Joi.string().isoDate().required(),
  location: Joi.string().min(2).max(255).required(),
  country: Joi.string().optional(),
  city: Joi.string().optional(),
  capacity: Joi.number().integer().min(1).optional(),
  notes: Joi.string().max(1000).optional(),
}).unknown(false);
