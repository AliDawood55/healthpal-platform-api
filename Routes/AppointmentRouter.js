import { Router } from 'express';
import ctrl from '../Controllers/AppointmentController.js';
import v from '../Validator/appointmentValidator.js';

const router = Router();

router.post('/', v.validateCreateAppointment, ctrl.createAppointment);


export default router;
