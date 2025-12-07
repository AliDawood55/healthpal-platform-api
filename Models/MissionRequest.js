import pool from '../Config/DBconnection.js';

export async function createRequest({ availability_id, patient_id, notes }) {
  const [result] = await pool.promise().query(
    `INSERT INTO mission_requests (availability_id, patient_id, status, notes, created_at)
     VALUES (?, ?, 'requested', ?, NOW())`,
    [availability_id, patient_id, notes || null]
  );
  return { id: result.insertId };
}

export async function listByAvailability(availability_id) {
  const [rows] = await pool.promise().query(
    `SELECT id, availability_id, patient_id, status, notes, created_at
     FROM mission_requests WHERE availability_id = ? ORDER BY created_at DESC`,
    [availability_id]
  );
  return rows;
}

export async function getById(id) {
  const [rows] = await pool.promise().query(
    `SELECT id, availability_id, patient_id, status, notes, created_at
     FROM mission_requests WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function updateStatus(id, status) {
  const [result] = await pool.promise().query(
    `UPDATE mission_requests SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result;
}

export default { createRequest, listByAvailability, getById, updateStatus };

