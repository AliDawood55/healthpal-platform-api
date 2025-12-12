import Joi from 'joi';

const createAppointmentSchema = Joi.object({
  patient_id: Joi.number().integer().required(),
  doctor_id: Joi.number().integer().required(),
  scheduled_at: Joi.string().required(),
  status: Joi.string().optional(),
  notes: Joi.string().allow('', null),
});

export const validateCreateAppointment = (req, res, next) => {
  const { error, value } = createAppointmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res
      .status(400)
      .json({ errors: error.details.map((d) => d.message) });
  }
  req.body = value;
  next();
};

export default {
  validateCreateAppointment,
};
