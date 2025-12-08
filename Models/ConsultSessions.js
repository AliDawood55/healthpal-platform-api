import db from '../Config/DBconnection.js';
import dayjs from 'dayjs';

export default {
  async insert({ appointment_id, mode, signaling_url, room_token }) {
    const created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const [res] = await db.query(
      `INSERT INTO consult_sessions
        (appointment_id, mode, signaling_url, room_token, created_at)
        VALUES (?, ?, ?, ?, ?)`,
      [appointment_id, mode, signaling_url || null, room_token || null, created_at]
    );

    return this.findById(res.insertId);
  },

  async findById(id) {
    const [rows] = await db.query(
      `SELECT * FROM consult_sessions WHERE id = ?`,
        [id]
    );
    return rows[0] || null;
  },

  async find(filters = {}) {
    const where = [];
    const vals = [];

    if (filters.appointment_id) { where.push('appointment_id = ?'); vals.push(filters.appointment_id); }
    if (filters.mode)          { where.push('mode = ?');           vals.push(filters.mode); }

    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT * FROM consult_sessions ${clause}
        ORDER BY COALESCE(started_at, created_at) DESC`,
      vals
    );

    return rows;
  },

  async findForDoctor(doctorUserId) {
    const [rows] = await db.query(
      `SELECT cs.*
        FROM consult_sessions cs
        JOIN appointments a ON a.id = cs.appointment_id
        JOIN doctors d ON d.id = a.doctor_id
        WHERE d.user_id = ?
        ORDER BY COALESCE(cs.started_at, cs.created_at) DESC`,
      [doctorUserId]
    );
    return rows;
  },

  async findForPatient(patientUserId) {
    const [rows] = await db.query(
      `SELECT cs.*
        FROM consult_sessions cs
        JOIN appointments a ON a.id = cs.appointment_id
        JOIN patients p ON p.id = a.patient_id
        WHERE p.user_id = ?
        ORDER BY COALESCE(cs.started_at, cs.created_at) DESC`,
      [patientUserId]
    );
    return rows;
  },

  async markStarted(id, started_at) {
    await db.query(
      `UPDATE consult_sessions SET started_at = ? WHERE id = ?`,
      [started_at, id]
    );
    return this.findById(id);
  },

  async markEnded(id, ended_at) {
    await db.query(
      `UPDATE consult_sessions SET ended_at = ? WHERE id = ?`,
      [ended_at, id]
    );
    return this.findById(id);
  }
};
