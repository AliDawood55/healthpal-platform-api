// Models/Appointments.js
import db from "../Config/DBconnection.js";

export default {
  // 🟢 إرجاع موعد واحد (معلومات بسيطة من جدول appointments)
  async findById(id) {
    const [rows] = await db.query(
      `SELECT *
       FROM appointments
       WHERE id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  // 🟢 إرجاع موعد واحد مع ربطه بجدول patients و doctors (اختياري)
  async findFullById(id) {
    const [rows] = await db.query(
      `SELECT 
          a.*,
          p.user_id AS patient_user_id,
          d.user_id AS doctor_user_id
       FROM appointments a
       LEFT JOIN patients p ON p.id = a.patient_id
       LEFT JOIN doctors d ON d.id = a.doctor_id
       WHERE a.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  // 🟢 إنشاء موعد جديد
  async create({ patient_id, doctor_id, scheduled_at, notes }) {
    const [res] = await db.query(
      `INSERT INTO appointments
         (patient_id, doctor_id, status, scheduled_at, notes, created_at)
       VALUES (?, ?, 'scheduled', ?, ?, NOW())`,
      [patient_id, doctor_id, scheduled_at, notes]
    );

    return this.findById(res.insertId);
  },

  // 🟢 جلب جميع المواعيد (مع ربط المريض والدكتور لو حاب)
  async findAll() {
    const [rows] = await db.query(
      `SELECT 
          a.*,
          p.user_id AS patient_user_id,
          d.user_id AS doctor_user_id
       FROM appointments a
       LEFT JOIN patients p ON p.id = a.patient_id
       LEFT JOIN doctors d ON d.id = a.doctor_id
       ORDER BY a.scheduled_at DESC`
    );
    return rows;
  },
};
