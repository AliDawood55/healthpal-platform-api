import Joi from 'joi';

export const createEquipmentSchema = Joi.object({
  name: Joi.string().min(2).required(),
  description: Joi.string().allow('', null),
  category: Joi.string().required(),
  status: Joi.string().valid('available', 'reserved', 'maintenance').optional()
});

export const createReservationSchema = Joi.object({
  equipment_id: Joi.number().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required()
});
