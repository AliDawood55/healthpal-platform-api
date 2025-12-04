// Models/Donation.js
const dayjs = require('dayjs');
const { initDB } = require('../Config/DBconnection');

module.exports = {
    // إنشاء تبرّع جديد
    async createDonation(data) {
        const db = await initDB();
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const [res] = await db.query(
            `INSERT INTO donations
             (case_id, donor_id, amount, payment_method, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [
                data.case_id,
                data.donor_id,
                data.amount,
                data.payment_method,
                now
            ]
        );

        const [rows] = await db.query(
            `SELECT * FROM donations WHERE id = ?`,
            [res.insertId]
        );

        return rows[0];
    },

    // كل التبرعات على حالة معيّنة
    async listByCase(caseId) {
        const db = await initDB();

        const [rows] = await db.query(
            `SELECT d.*, u.name AS donor_name
             FROM donations d
             JOIN users u ON u.id = d.donor_id
             WHERE d.case_id = ?
             ORDER BY d.created_at DESC`,
            [caseId]
        );

        return rows;
    },

    // ملخص تبرعات متبرّع معيّن
    async summaryForDonor(donorUserId) {
        const db = await initDB();

        const [rows] = await db.query(
            `SELECT d.*, c.title AS case_title, c.category
             FROM donations d
             JOIN sponsorship_cases c ON c.id = d.case_id
             WHERE d.donor_id = ?
             ORDER BY d.created_at DESC`,
            [donorUserId]
        );

        const [[agg]] = await db.query(
            `SELECT COALESCE(SUM(amount), 0) AS total_amount,
                    COUNT(*) AS donations_count
             FROM donations
             WHERE donor_id = ?`,
            [donorUserId]
        );

        return { donations: rows, stats: agg };
    }
};
