// Routes/AppointmentRouter.js
import { Router } from "express";
import ctrl from "../Controllers/AppointmentController.js";
import v from "../Validator/appointmentValidator.js";

const router = Router();

// GET /api/v1/appointments   -> جميع المواعيد
router.get("/", ctrl.getAllAppointments);

// GET /api/v1/appointments/:id   -> موعد واحد
router.get("/:id", ctrl.getAppointmentById);

// POST /api/v1/appointments     -> إضافة موعد جديد
router.post("/", v.validateCreateAppointment, ctrl.createAppointment);

export default router;
