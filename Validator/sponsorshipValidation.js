import Joi from 'joi';

const createCaseSchema = Joi.object({
  patient_id: Joi.number().integer().required(),
  title: Joi.string().min(3).max(150).required(),
  description: Joi.string().min(10).max(5000).required(),
  category: Joi.string()
    .valid('surgery', 'cancer', 'dialysis', 'rehab')
    .required(),
  goal_amount: Joi.number().positive().precision(2).required()
});

const createDonationSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  payment_method: Joi.string()
    .valid('cash', 'bank_transfer', 'online', 'other')
    .required()
});

export const validateCreateCase = (req, res, next) => {
  const { error, value } = createCaseSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {
    return res
      .status(422)
      .json({ errors: error.details.map((d) => d.message) });
  }

  req.body = value;
  next();
};

export const validateCreateDonation = (req, res, next) => {
  const { error, value } = createDonationSchema.validate(req.body, {
    abortEarly: false
  });

  if (error) {
    return res
      .status(422)
      .json({ errors: error.details.map((d) => d.message) });
  }

  req.body = value;
  next();
};

export default {
  validateCreateCase,
  validateCreateDonation,
};
