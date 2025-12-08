// /Validator/medicationValidator.js
import Joi from 'joi';

export const createRequestSchema = Joi.object({
  medication_name: Joi.string().min(2).max(200).required()
    .messages({
      'string.base': 'Medication name must be a string',
      'string.empty': 'Medication name is required',
      'string.min': 'Medication name must be at least 2 characters',
      'any.required': 'Medication name is required',
    }),
  quantity: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.min': 'Quantity must be at least 1',
      'any.required': 'Quantity is required',
    }),
  needed_by: Joi.date().optional()
    .messages({
      'date.base': 'Needed by must be a valid date',
    }),
});
