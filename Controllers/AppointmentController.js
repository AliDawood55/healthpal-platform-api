// Controllers/AppointmentController.js
import Appointments from "../Models/Appointments.js";

// 🟢 إنشاء موعد جديد
export const createAppointment = async (req, res, next) => {
  try {
    const { role } = req.user; // user جاي من Middleware auth

    if (role !== "admin" && role !== "doctor") {
      return res
        .status(403)
        .json({ error: "Only admin or doctor can create appointments" });
    }

    const { patient_id, doctor_id, scheduled_at, notes } = req.body;

    const appt = await Appointments.create({
      patient_id,
      doctor_id,
      scheduled_at,
      notes: notes || null,
    });

    res.status(201).json({ success: true, data: appt });
  } catch (e) {
    next(e);
  }
};

// 🟢 عرض جميع المواعيد
export const getAllAppointments = async (_req, res, next) => {
  try {
    const appts = await Appointments.findAll();
    res.json({ success: true, data: appts });
  } catch (e) {
    next(e);
  }
};

// 🟢 عرض موعد واحد حسب الـ id
export const getAppointmentById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // ممكن تستخدم findById بدل findFullById لو مش محتاج join
    const appt = await Appointments.findFullById(id);

    if (!appt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ success: true, data: appt });
  } catch (e) {
    next(e);
  }
};

export default {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
};
