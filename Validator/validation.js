
// Validation schemas
import { z } from "zod";
import Joi from "joi";

// ---------------- ZOD SCHEMAS (users, alerts, guides) ----------------

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(150),
  email: z.string().email("Invalid email").max(200),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(255),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(150).optional(),
    email: z.string().email().max(200).optional(),
    password: z.string().min(6).max(255).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    };
  }
  return { ok: true, data: result.data };
}

// Alerts
export const createAlertSchema = z.object({
  title: z.string().min(3).max(200),
  message: z.string().min(3).max(2000),
  severity: z.enum(["info", "warning", "critical"]),
  region: z.string().max(120).optional(),
});

export const updateAlertSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    message: z.string().min(3).max(2000).optional(),
    severity: z.enum(["info", "warning", "critical"]).optional(),
    region: z.string().max(120).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field is required",
  });

// Health guides
export const createGuideSchema = z.object({
  title: z.string().min(3).max(200),
  category: z.enum([
    "first_aid",
    "chronic_care",
    "nutrition",
    "maternal",
    "mental_health",
    "general",
  ]),
  language: z.enum(["ar", "en"]).optional(),
  content: z.string().min(10).max(10000),
});

export const updateGuideSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    category: z
      .enum([
        "first_aid",
        "chronic_care",
        "nutrition",
        "maternal",
        "mental_health",
        "general",
      ])
      .optional(),
    language: z.enum(["ar", "en"]).optional(),
    content: z.string().min(10).max(10000).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field is required",
  });

// ---------------- JOI SCHEMAS (counseling, auth, NGO, etc.) ----------------

export const counselingRequestSchema = Joi.object({
  topic: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Topic is required",
    "any.required": "Topic is required",
  }),
  message: Joi.string().min(5).required().messages({
    "string.empty": "Message is required",
    "any.required": "Message is required",
  }),
  for_children: Joi.boolean().optional(),
  severity: Joi.string().valid("mild", "moderate", "severe").default("moderate"),
  preferred_mode: Joi.string().valid("video", "audio", "chat").default("chat"),
}).unknown(false);

export const supportGroupSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Group title is required",
  }),
  topic: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Topic is required",
  }),
  description: Joi.string().min(5).max(1000).optional(),
  is_private: Joi.boolean().default(false),
}).unknown(false);

export const roleSchema = Joi.string()
  .valid("patient", "doctor", "donor", "ngo", "admin")
  .required()
  .messages({
    "any.only":
      "Role must be one of: patient, doctor, donor, ngo, or admin",
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

export const validateCounselorAssignment = (req, res, next) => {
  req.body = req.body || {};
  req.body.counselorId = req.body.counselorId || req.user.id;
  next();
};

export const requestSchema = Joi.object({
  notes: Joi.string().max(1000).optional(),
}).unknown(false);

export const ngoSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    "string.empty": "NGO name is required",
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

export const validateCreateUser = (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(422).json({
      errors: error.details.map((d) => d.message),
    });
  }
  req.body = value;
  next();
};
