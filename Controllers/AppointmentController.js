import Appointments from '../Models/Appointments.js';

export const createAppointment = async (req, res, next) => {
  try {
    const { role, id: userId } = req.user;
    if (role !== 'admin' && role !== 'doctor') {
      return res.status(403).json({ error: 'Only admin or doctor can create appointments' });
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

export default {
  createAppointment,
};
