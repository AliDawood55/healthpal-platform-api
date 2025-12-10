import pool from '../Config/DBconnection.js';

export async function createAvailability({ mission_id = null, doctor_user_id, start_at, end_at, location, country, city, capacity, notes }) {
  const [result] = await pool.query(
    `INSERT INTO mission_availability (mission_id, doctor_user_id, start_at, end_at, location, country, city, capacity, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [mission_id || null, doctor_user_id, start_at, end_at, location, country || null, city || null, capacity || null, notes || null]
  );
  return { id: result.insertId, mission_id: mission_id || null };
}

export async function listByDoctor(doctor_user_id) {
  const [rows] = await pool.query(
    `SELECT id, mission_id, doctor_user_id, start_at, end_at, location, country, city, capacity, notes, created_at
     FROM mission_availability WHERE doctor_user_id = ? ORDER BY start_at DESC`,
    [doctor_user_id]
  );
  return rows;
}

export async function getAvailabilityById(id) {
  const [rows] = await pool.query(
    `SELECT id, mission_id, doctor_user_id, start_at, end_at, location, country, city, capacity, notes, created_at
     FROM mission_availability WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export default { createAvailability, listByDoctor, getAvailabilityById };
