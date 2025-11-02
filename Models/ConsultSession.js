import pool from "../Config/DBconnection.js";
import crypto from "crypto";

class ConsultSession {
  static async createOrGet(appointment_id, mode, userId) {
    const p = pool.promise();
    const allowed = ["video", "audio", "async"];
    if (!allowed.includes(mode)) throw new Error("Invalid mode");

    const [appts] = await p.query(
      `SELECT id, patient_id, doctor_id 
       FROM appointments 
       WHERE id = ? AND (patient_id = ? OR doctor_id = ?)`,
      [appointment_id, userId, userId]
    );
    if (!appts.length) throw Object.assign(new Error("Forbidden"), { status: 403 });

    const [existing] = await p.query(
      `SELECT id, appointment_id, mode, signaling_url, room_token, started_at, ended_at, created_at
       FROM consult_sessions WHERE appointment_id = ?`,
      [appointment_id]
    );
    if (existing.length) return existing[0];

    const token = mode === "async" ? null : `tok_${crypto.randomBytes(12).toString("hex")}`;
    const signaling = mode === "async" ? null : "wss://signal.healthpal.local/room";

    const [ins] = await p.query(
      `INSERT INTO consult_sessions (appointment_id, mode, signaling_url, room_token, started_at, created_at)
       VALUES (?, ?, ?, ?, NULL, NOW())`,
      [appointment_id, mode, signaling, token]
    );

    const [rows] = await p.query(
      `SELECT id, appointment_id, mode, signaling_url, room_token, started_at, ended_at, created_at 
       FROM consult_sessions WHERE id = ?`,
      [ins.insertId]
    );
    return rows[0];
  }

  static async getByAppointment(appointmentId) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT id, appointment_id, mode, signaling_url, room_token, started_at, ended_at, created_at
       FROM consult_sessions WHERE appointment_id = ?`,
      [appointmentId]
    );
    return rows[0] || null;
  }

  static async addMessage(appointmentId, userId, message, attachment_url = null) {
    const p = pool.promise();
    const [appts] = await p.query(
      `SELECT id, patient_id, doctor_id 
       FROM appointments 
       WHERE id = ? AND (patient_id = ? OR doctor_id = ?)`,
      [appointmentId, userId, userId]
    );
    if (!appts.length) throw Object.assign(new Error("Forbidden"), { status: 403 });

    const [ins] = await p.query(
      `INSERT INTO consult_messages (appointment_id, sender_user_id, message, attachment_url, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [appointmentId, userId, message, attachment_url]
    );
    return ins.insertId;
  }

  static async listMessages(appointmentId) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT m.id, m.sender_user_id, u.name AS sender_name, m.message, m.attachment_url, m.created_at
       FROM consult_messages m 
       JOIN users u ON u.id = m.sender_user_id
       WHERE m.appointment_id = ?
       ORDER BY m.created_at ASC`,
      [appointmentId]
    );
    return rows;
  }

  static async translateMessage(messageId, userId, target_lang, translated_text) {
    const allowed = ["ar", "en"];
    if (!target_lang || !allowed.includes(target_lang))
      throw Object.assign(new Error("Invalid target_lang"), { status: 400 });

    const p = pool.promise();
    const [msgRows] = await p.query(
      `SELECT m.id, m.message, m.appointment_id, a.patient_id, a.doctor_id 
       FROM consult_messages m 
       JOIN appointments a ON a.id = m.appointment_id 
       WHERE m.id = ?`,
      [messageId]
    );

    if (!msgRows.length)
      throw Object.assign(new Error("Message not found"), { status: 404 });

    const msg = msgRows[0];
    if (msg.patient_id !== userId && msg.doctor_id !== userId)
      throw Object.assign(new Error("Forbidden"), { status: 403 });

    const textToStore =
      translated_text && typeof translated_text === "string"
        ? translated_text
        : msg.message;

    await p.query(
      `INSERT INTO translations (message_id, source_lang, target_lang, translated_text)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE translated_text = VALUES(translated_text)`,
      [messageId, target_lang === "ar" ? "en" : "ar", target_lang, textToStore]
    );

    return true;
  }
}

export default ConsultSession;
