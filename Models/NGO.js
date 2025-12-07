import pool from '../Config/DBconnection.js';

export async function createNGO(name) {
  const [result] = await pool.promise().query(
    `INSERT INTO ngos (name, verified, created_at) VALUES (?, 0, NOW())`,
    [name]
  );
  return { id: result.insertId, name, verified: 0 };
}

export async function listVerifiedNGOs() {
  const [rows] = await pool.promise().query(
    `SELECT id, name, verified, created_at FROM ngos WHERE verified = 1 ORDER BY created_at DESC`
  );
  return rows;
}

export async function getById(id) {
  const [rows] = await pool.promise().query(
    `SELECT id, name, verified, created_at FROM ngos WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function verifyNGO(id) {
  const [result] = await pool.promise().query(
    `UPDATE ngos SET verified = 1 WHERE id = ?`,
    [id]
  );
  return result;
}

export default { createNGO, listVerifiedNGOs, getById, verifyNGO };
