import pool from '../Config/DBconnection.js';
import { validate, createAlertSchema, updateAlertSchema } from '../Validator/validation.js';

export async function listAlerts(req, res) {
  try {
    const { severity, region, from, to, page = '1', limit = '20' } = req.query;
    const where = [];
    const params = [];
    if (severity) { where.push('severity = ?'); params.push(severity); }
    if (region) { where.push('region = ?'); params.push(region); }
    if (from) { where.push('created_at >= ?'); params.push(new Date(from)); }
    if (to) { where.push('created_at <= ?'); params.push(new Date(to)); }
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (p - 1) * l;
    const sql = `SELECT id, title, message, severity, region, created_at FROM alerts ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(l, offset);
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('listAlerts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createAlert(req, res) {
  const v = validate(createAlertSchema, req.body);
  if (!v.ok) return res.status(400).json({ errors: v.errors });
  const { title, message, severity, region } = v.data;
  try {
    const [result] = await pool.query(
      'INSERT INTO alerts (title, message, severity, region, created_at) VALUES (?,?,?,?,?)',
      [title, message, severity, region ?? null, new Date()]
    );
    const [rows] = await pool.query(
      'SELECT id, title, message, severity, region, created_at FROM alerts WHERE id = ?',
      [result.insertId]
    );
    const alert = rows[0];
    // Broadcast to SSE listeners if present
    if (global.__alertsSSE && typeof global.__alertsSSE.broadcast === 'function') {
      global.__alertsSSE.broadcast({ type: 'created', data: alert });
    }
    res.status(201).json(alert);
  } catch (err) {
    console.error('createAlert error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateAlert(req, res) {
  const { id } = req.params;
  if (!/^[0-9]+$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
  const v = validate(updateAlertSchema, req.body);
  if (!v.ok) return res.status(400).json({ errors: v.errors });
  const { title, message, severity, region } = v.data;
  try {
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (message !== undefined) { fields.push('message = ?'); params.push(message); }
    if (severity !== undefined) { fields.push('severity = ?'); params.push(severity); }
    if (region !== undefined) { fields.push('region = ?'); params.push(region); }
    if (!fields.length) return res.status(400).json({ error: 'No valid fields provided' });
    params.push(id);
    const [result] = await pool.query(`UPDATE alerts SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Alert not found' });
    const [rows] = await pool.query('SELECT id, title, message, severity, region, created_at FROM alerts WHERE id = ?', [id]);
    const alert = rows[0];
    if (global.__alertsSSE && typeof global.__alertsSSE.broadcast === 'function') {
      global.__alertsSSE.broadcast({ type: 'updated', data: alert });
    }
    res.json(alert);
  } catch (err) {
    console.error('updateAlert error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteAlert(req, res) {
  const { id } = req.params;
  if (!/^[0-9]+$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [result] = await pool.query('DELETE FROM alerts WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Alert not found' });
    res.status(204).send();
  } catch (err) {
    console.error('deleteAlert error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
