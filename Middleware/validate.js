// /Middleware/validate.js
export default function validate(schema) {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: details,
      });
    }

    next(); // pass control to next middleware or controller
  };
}
