const { initDB } = require('../Config/DBconnection');
const dayjs = require('dayjs');

module.exports = {
    async insert({ appointment_id, mode, signaling_url, room_token }) {
        const db = await initDB();
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
        const db = await initDB();
        const [rows] = await db.query(`SELECT * FROM consult_sessions WHERE id = ?`, [id]);
        return rows[0] || null;
    },

    async find(filters = {}) {
        const db = await initDB();
        const where = [];
        const vals = [];
        if (filters.appointment_id) { where.push('appointment_id = ?'); vals.push(filters.appointment_id); }
        if (filters.mode)          { where.push('mode = ?');           vals.push(filters.mode); }
        const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
        const [rows] = await db.query(
        `SELECT * FROM consult_sessions ${clause} ORDER BY COALESCE(started_at, created_at) DESC`,
        vals
        );
        return rows;
    },

    async markStarted(id, started_at) {
        const db = await initDB();
        await db.query(`UPDATE consult_sessions SET started_at = ? WHERE id = ?`, [started_at, id]);
        return this.findById(id);
    },

    async markEnded(id, ended_at) {
        const db = await initDB();
        await db.query(`UPDATE consult_sessions SET ended_at = ? WHERE id = ?`, [ended_at, id]);
        return this.findById(id);
    }
};
