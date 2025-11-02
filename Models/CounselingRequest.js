import pool from '../Config/DBconnection.js';

class CounselingRequest {

  static async create(data) {
    const p = pool.promise();
    const [res] = await p.query(
      `INSERT INTO counseling_requests (created_by_user_id, topic, details, for_children, severity, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'open', NOW())`,
      [data.created_by_user_id, data.topic, data.details, data.for_children ? 1 : 0, data.severity]
    );
    return { id: res.insertId };
  }

  static async listForUser(userId, status = null) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT id, topic, details, for_children, severity, status,
              assigned_counselor_user_id, created_at
       FROM counseling_requests
       WHERE created_by_user_id = ? AND (? IS NULL OR status = ?)
       ORDER BY created_at DESC`,
      [userId, status, status]
    );
    return rows;
  }

  static async listAll(status = null) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT cr.id, cr.topic, cr.details, cr.for_children, cr.severity, cr.status,
              cr.assigned_counselor_user_id, cr.created_at,
              u.name AS requester,
              uc.name AS counselor
       FROM counseling_requests cr
       JOIN users u ON u.id = cr.created_by_user_id
       LEFT JOIN users uc ON uc.id = cr.assigned_counselor_user_id
       WHERE (? IS NULL OR cr.status = ?)
       ORDER BY cr.created_at DESC`,
      [status, status]
    );
    return rows;
  }

  static async getById(id) {
    const p = pool.promise();
    const [rows] = await p.query(`SELECT * FROM counseling_requests WHERE id = ?`, [id]);
    return rows[0];
  }

  static async assignCounselor(requestId, user, counselorId = null) {
    const p = pool.promise();
    const [[row]] = await p.query(
      `SELECT id, assigned_counselor_user_id, status FROM counseling_requests WHERE id = ?`,
      [requestId]
    );
    if (!row) throw Object.assign(new Error('Request not found'), { status: 404 });

    if (!['admin', 'doctor'].includes(user.role))
      throw Object.assign(new Error('Forbidden'), { status: 403 });

    const assignedId = counselorId || user.id;

    await p.query(
      `UPDATE counseling_requests
       SET assigned_counselor_user_id = ?, status = 'assigned'
       WHERE id = ?`,
      [assignedId, requestId]
    );
    return true;
  }

  static async updateStatus(id, user, newStatus) {
    const allowed = ['open', 'assigned', 'in_progress', 'resolved', 'closed'];
    if (!allowed.includes(newStatus))
      throw Object.assign(new Error('Invalid status'), { status: 400 });

    const p = pool.promise();
    const [[row]] = await p.query(
      `SELECT id, assigned_counselor_user_id FROM counseling_requests WHERE id = ?`,
      [id]
    );
    if (!row) throw Object.assign(new Error('Request not found'), { status: 404 });

    const canChange =
      user.role === 'admin' ||
      (['doctor', 'ngo'].includes(user.role) &&
        Number(row.assigned_counselor_user_id) === Number(user.id));

    if (!canChange)
      throw Object.assign(new Error('Forbidden'), { status: 403 });

    await p.query(`UPDATE counseling_requests SET status = ? WHERE id = ?`, [
      newStatus,
      id,
    ]);
    return true;
  }
}

export default CounselingRequest;
