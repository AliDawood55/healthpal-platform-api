import pool from "../Config/DBconnection.js";
import crypto from "crypto";

class AnonymousChat {
  static async start({ started_by_user_id = null, initial_topic = null, for_children = false } = {}) {
    const token = crypto.randomBytes(24).toString("hex");
    const p = pool.promise();
    const [ins] = await p.query(
      `INSERT INTO anon_chat_sessions (session_token, started_by_user_id, initial_topic, for_children, is_closed, created_at)
       VALUES (?, ?, ?, ?, 0, NOW())`,
      [token, started_by_user_id, initial_topic, for_children ? 1 : 0]
    );
    return { id: ins.insertId, session_token: token };
  }

  static async getSessionByToken(token) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT id, session_token, is_closed, assigned_counselor_user_id, created_at
       FROM anon_chat_sessions WHERE session_token = ?`,
      [token]
    );
    return rows[0];
  }

  static async sendMessageBySessionId(sessionId, sender, content) {
    const p = pool.promise();
    const [ins] = await p.query(
      `INSERT INTO anon_chat_messages (session_id, sender, content, created_at)
       VALUES (?, ?, ?, NOW())`,
      [sessionId, sender, content]
    );
    return { id: ins.insertId };
  }

  static async listMessagesBySessionId(sessionId) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT id, sender, content, created_at
       FROM anon_chat_messages
       WHERE session_id = ?
       ORDER BY created_at ASC
       LIMIT 500`,
      [sessionId]
    );
    return rows;
  }

  static async listOpenSessions(limit = 200) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT s.id, s.session_token, s.created_at, s.assigned_counselor_user_id,
              COUNT(m.id) AS messages_count
       FROM anon_chat_sessions s
       LEFT JOIN anon_chat_messages m ON m.session_id = s.id
       WHERE s.is_closed = 0
       GROUP BY s.id
       ORDER BY s.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }

  static async assignSession(sessionId, user) {
    const p = pool.promise();
    const [[s]] = await p.query(
      `SELECT id, assigned_counselor_user_id, is_closed FROM anon_chat_sessions WHERE id = ?`,
      [sessionId]
    );
    if (!s) throw Object.assign(new Error("session not found"), { status: 404 });
    if (s.is_closed) throw Object.assign(new Error("session closed"), { status: 410 });
    if (s.assigned_counselor_user_id && Number(s.assigned_counselor_user_id) !== Number(user.id))
      throw Object.assign(new Error("already assigned"), { status: 409 });

    await p.query(
      `UPDATE anon_chat_sessions SET assigned_counselor_user_id = ? WHERE id = ?`,
      [user.id, sessionId]
    );
    return true;
  }

  static async counselorSend(sessionId, counselorUserId, content) {
    const p = pool.promise();
    const [[s]] = await p.query(
      `SELECT id, assigned_counselor_user_id, is_closed
       FROM anon_chat_sessions WHERE id = ?`,
      [sessionId]
    );
    if (!s) throw Object.assign(new Error("session not found"), { status: 404 });
    if (s.is_closed) throw Object.assign(new Error("session closed"), { status: 410 });
    if (!s.assigned_counselor_user_id || Number(s.assigned_counselor_user_id) !== Number(counselorUserId))
      throw Object.assign(new Error("not assigned counselor"), { status: 403 });

    const [ins] = await p.query(
      `INSERT INTO anon_chat_messages (session_id, sender, content, created_at)
       VALUES (?, 'counselor', ?, NOW())`,
      [sessionId, content]
    );
    return { id: ins.insertId };
  }

  static async closeSession(sessionId) {
    const p = pool.promise();
    const [res] = await p.query(
      `UPDATE anon_chat_sessions SET is_closed = 1 WHERE id = ?`,
      [sessionId]
    );
    return res.affectedRows > 0;
  }
}

export default AnonymousChat;
