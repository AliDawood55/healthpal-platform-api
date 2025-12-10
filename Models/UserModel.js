import pool from "../Config/DBconnection.js";

export async function findByEmail(email) {
  const [rows] = await pool.query(
    `SELECT id , name, email, password_hash AS password, role, is_active FROM users
      WHERE email = ?`,
    [email]
  );
  return rows;
}


export async function checkIfEmailExists(email) {
  const [rows] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query(
    "SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE id = ?",
    [id]
  );
  return rows[0];
}

export async function createUser(name, email, hashedPassword, role) {
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
    [name, email, hashedPassword, role]
  );
  return result;
}

export async function updateUser(id, { name, email, password_hash, role, is_active }) {
  let query = "UPDATE users SET updated_at = NOW()";
  const params = [];

  if (name) { query += ", name = ?"; params.push(name); }
  if (email) { query += ", email = ?"; params.push(email); }
  if (password_hash) { query += ", password_hash = ?"; params.push(password_hash); }
  if (role) { query += ", role = ?"; params.push(role); }
  if (typeof is_active !== "undefined") { query += ", is_active = ?"; params.push(is_active); }

  query += " WHERE id = ?";
  params.push(id);

  const [result] = await pool.query(query, params);
  return result;
}

export async function deleteUser(id) {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result;
}

export async function listUsers(activeOnly = false) {
  const condition = activeOnly ? "WHERE is_active = 1" : "";
  const [rows] = await pool.query(
    `SELECT id, name, email, role, is_active, created_at, updated_at FROM users ${condition}`
  );
  return rows;
}

export async function toggleUserActive(id, status) {
  const [result] = await pool.query(
    "UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?",
    [status ? 1 : 0, id]
  );
  return result;
}

export async function countUsers() {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS cnt FROM users"
  );
  return rows[0].cnt;
}

export default {
  findByEmail,
  checkIfEmailExists,
  createUser,
  findById,
  updateUser,
  deleteUser,
  listUsers,
  toggleUserActive,
  countUsers,
};