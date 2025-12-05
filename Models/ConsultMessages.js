import db from '../Config/DBconnection.js';
import dayjs from 'dayjs';

export default {
    async insert({ appointment_id, sender_user_id, message, attachment_url }) {
        const created_at = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const [res] = await db.query(
            `INSERT INTO consult_messages
                (appointment_id, sender_user_id, message, attachment_url, created_at)
                VALUES (?, ?, ?, ?, ?)`,
            [appointment_id, sender_user_id, message, attachment_url, created_at]
        );

        const [rows] = await db.query(
            `SELECT * FROM consult_messages WHERE id = ?`,
            [res.insertId]
        );

        return rows[0];
    },

    async findByAppointment(appointment_id) {
        const [rows] = await db.query(
            `SELECT * FROM consult_messages
                WHERE appointment_id = ?
                ORDER BY id ASC`,
            [appointment_id]
        );

        return rows;
    }
};
