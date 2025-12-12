import pool from '../Config/DBconnection.js';
import argon2 from 'argon2';
import { createUserSchema, updateUserSchema, validate } from '../Validator/validation.js';

export async function listUsers(req, res) {
	try {
		const [rows] = await pool.query('SELECT id, name, email, created_at, updated_at FROM users ORDER BY id DESC');
		res.json(rows);
	} catch (err) {
		console.error('listUsers error:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function getUser(req, res) {
	const { id } = req.params;
	if (!/^[0-9]+$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
	try {
		const [rows] = await pool.query('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?', [id]);
		if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
		res.json(rows[0]);
	} catch (err) {
		console.error('getUser error:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function createUser(req, res) {
	const validation = validate(createUserSchema, req.body);
	if (!validation.ok) return res.status(400).json({ errors: validation.errors });
	const { name, email, password } = validation.data;
	try {
		const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
		if (existing.length) return res.status(409).json({ error: 'Email already in use' });
		const hashed = await argon2.hash(password);
		const [result] = await pool.query('INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?,?,?,?,?)', [
			name, email, hashed, new Date(), new Date()
		]);
		const [rowData] = await pool.query('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?', [result.insertId]);
		res.status(201).json(rowData[0]);
	} catch (err) {
		console.error('createUser error:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function updateUser(req, res) {
	const { id } = req.params;
	if (!/^[0-9]+$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
	const validation = validate(updateUserSchema, req.body);
	if (!validation.ok) return res.status(400).json({ errors: validation.errors });
	const { name, email } = validation.data;
	let { password } = validation.data;
	try {
		const [exists] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
		if (!exists.length) return res.status(404).json({ error: 'User not found' });
		const fields = [];
		const params = [];
		if (name !== undefined) { fields.push('name = ?'); params.push(name); }
		if (email !== undefined) { fields.push('email = ?'); params.push(email); }
		if (password !== undefined) { password = await argon2.hash(password); fields.push('password = ?'); params.push(password); }
		if (!fields.length) return res.status(400).json({ error: 'No valid fields provided' });
		fields.push('updated_at = ?');
		params.push(new Date(), id);
		await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
		const [rowData] = await pool.query('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?', [id]);
		res.json(rowData[0]);
	} catch (err) {
		console.error('updateUser error:', err);
		if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already in use' });
		res.status(500).json({ error: 'Internal server error' });
	}
}

export async function deleteUser(req, res) {
	const { id } = req.params;
	if (!/^[0-9]+$/.test(id)) return res.status(400).json({ error: 'Invalid id' });
	try {
		const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
		if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
		res.status(204).send();
	} catch (err) {
		console.error('deleteUser error:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
}

