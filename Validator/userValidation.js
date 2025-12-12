import Joi from "joi";


export const registerSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters long",
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),

  password: Joi.string().min(6).max(100).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),

  role: Joi.string().valid("patient", "doctor", "donor", "ngo", "admin").default("patient"),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format",
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid("patient", "doctor", "donor", "ngo", "admin").optional(),
  is_active: Joi.boolean().optional(),
});
