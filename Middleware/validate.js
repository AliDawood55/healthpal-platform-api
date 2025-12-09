// /Middleware/validate.js
import Joi from "joi";

/**
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({
        status: "validation_error",
        errors: details,
      });
    }

    next(); 
  };
};

export default validate;
