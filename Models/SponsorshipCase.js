import dayjs from 'dayjs';
import db from '../Config/DBconnection.js';

export default {
    async createCase(data) {
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const [res] = await db.query(
            `INSERT INTO sponsorship_cases
                (patient_id, title, description, category, goal_amount, raised_amount, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 0, 'open', ?, ?)`,
            [
                data.patient_id,
                data.title,
                data.description,
                data.category,
                data.goal_amount,
                now,
                now
            ]
        );

        return this.findById(res.insertId);
    },

    async findById(id) {
        const [rows] = await db.query(
            `SELECT * FROM sponsorship_cases WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    async listCases(filters = {}) {
        const where = [];
        const vals = [];

        if (filters.status) {
            where.push('status = ?');
            vals.push(filters.status);
        }
        if (filters.category) {
            where.push('category = ?');
            vals.push(filters.category);
        }
        if (filters.patient_id) {
            where.push('patient_id = ?');
            vals.push(filters.patient_id);
        }

        const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

        const [rows] = await db.query(
            `SELECT * FROM sponsorship_cases ${clause}
                ORDER BY created_at DESC`,
            vals
        );
        return rows;
    },

    async addRaisedAmount(caseId, amount) {
        await db.query(
            `UPDATE sponsorship_cases
                SET raised_amount = raised_amount + ?, updated_at = NOW()
                WHERE id = ?`,
            [amount, caseId]
        );

        return this.findById(caseId);
    },

    async getCaseStats(caseId) {
        const [[stats]] = await db.query(
            `SELECT
                COALESCE(SUM(d.amount), 0) AS total_donated,
                COUNT(d.id) AS donations_count
                FROM donations d
                WHERE d.case_id = ?`,
            [caseId]
        );

        return stats;
    }
};
