import pool from '../Config/DBconnection.js';
import { validate, createGuideSchema, updateGuideSchema } from '../Validator/validation.js';

export async function listGuides(req, res) {
  try {
    const { category, language, q, page = '1', limit = '20' } = req.query;
    const where = [];
    const params = [];
    if (category) { where.push('category = ?'); params.push(category); }
    if (language) { where.push('language = ?'); params.push(language); }
    if (q) { where.push('(title LIKE ? OR content LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    const p = Math.max(parseInt(page, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (p - 1) * l;
    const sql = `SELECT id, title, category, language, content, created_at, updated_at FROM health_guides ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
    params.push(l, offset);
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('listGuides error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createGuide(req, res) {
  const v = validate(createGuideSchema, req.body);
  if (!v.ok) return res.status(400).json({ errors: v.errors });
  const { title, category, language, content } = v.data;
  try {
    const [result] = await pool.query(
      'INSERT INTO health_guides (title, category, language, content, created_at, updated_at) VALUES (?,?,?,?,?,?)',
      [title, category, language ?? 'ar', content, new Date(), new Date()]
    );
    const [rows] = await pool.query(
      'SELECT id, title, category, language, content, created_at, updated_at FROM health_guides WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('createGuide error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateGuide(req, res) {
  const { id } = req.params;
  if (!/^[0-9]+$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
  const v = validate(updateGuideSchema, req.body);
  if (!v.ok) return res.status(400).json({ errors: v.errors });
  const { title, category, language, content } = v.data;
  try {
    const fields = [];
    const params = [];
    if (title !== undefined) { fields.push('title = ?'); params.push(title); }
    if (category !== undefined) { fields.push('category = ?'); params.push(category); }
    if (language !== undefined) { fields.push('language = ?'); params.push(language); }
    if (content !== undefined) { fields.push('content = ?'); params.push(content); }
    if (!fields.length) return res.status(400).json({ error: 'No valid fields provided' });
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    const [result] = await pool.query(`UPDATE health_guides SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Guide not found' });
    const [rows] = await pool.query('SELECT id, title, category, language, content, created_at, updated_at FROM health_guides WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('updateGuide error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteGuide(req, res) {
  const { id } = req.params;
  if (!/^[0-9]+$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
  try {
    const [result] = await pool.query('DELETE FROM health_guides WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Guide not found' });
    res.status(204).send();
  } catch (err) {
    console.error('deleteGuide error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
