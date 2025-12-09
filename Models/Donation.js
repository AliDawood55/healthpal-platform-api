import dayjs from 'dayjs';
import db from '../Config/DBconnection.js';

export default {
  async createDonation(data) {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const [res] = await db.query(
      `INSERT INTO donations
        (case_id, donor_id, amount, payment_methode, created_at)
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
      `SELECT d.id, d.case_id, d.donor_id, d.amount,
        d.payment_methode AS payment_method,
        d.created_at
        FROM donations d
        WHERE d.id = ?`,
      [res.insertId]
    );

    return rows[0];
  },

  async listByCase(caseId) {
    const [rows] = await db.query(
      `SELECT d.id, d.case_id, d.donor_id, d.amount,
        d.payment_methode AS payment_method,
        d.created_at,
        u.name AS donor_name
        FROM donations d
        JOIN users u ON u.id = d.donor_id
        WHERE d.case_id = ?
        ORDER BY d.created_at DESC`,
      [caseId]
    );

    return rows;
  },

  async summaryForDonor(donorUserId) {
    const [rows] = await db.query(
      `SELECT d.id, d.case_id, d.amount,
        d.payment_methode AS payment_method,
        d.created_at,
        c.title AS case_title,
        c.category
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
