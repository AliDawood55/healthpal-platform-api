import pool from '../Config/DBconnection.js';

export async function createMission({ title, specialty, location, country, city, start_date, end_date, organizer_ngo_id, description, is_published = 1 }) {
  const [result] = await pool.promise().query(
    `INSERT INTO surgical_missions (title, specialty, location, country, city, start_date, end_date, organizer_ngo_id, description, is_published, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [title, specialty, location, country || null, city || null, start_date, end_date, organizer_ngo_id || null, description || null, is_published ? 1 : 0]
  );
  return { id: result.insertId };
}

export async function listPublishedMissions() {
  const [rows] = await pool.promise().query(
    `SELECT id, title, specialty, location, country, city, start_date, end_date, organizer_ngo_id, description, is_published, created_at
     FROM surgical_missions WHERE is_published = 1 ORDER BY start_date DESC`
  );
  return rows;
}

export async function getMissionById(id) {
  const [rows] = await pool.promise().query(
    `SELECT id, title, specialty, location, country, city, start_date, end_date, organizer_ngo_id, description, is_published, created_at
     FROM surgical_missions WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export default { createMission, listPublishedMissions, getMissionById };
