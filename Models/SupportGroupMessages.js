import pool from "../Config/DBconnection.js";

class SupportGroupMessages {
  static async addMessage(groupId, userId, message) {
    const p = pool.promise();
    await p.query(
      `INSERT INTO support_group_messages (group_id, sender_id, message, created_at)
       VALUES (?, ?, ?, NOW())`,
      [groupId, userId, message]
    );
    return true;
  }

  static async listMessages(groupId, limit = 50) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT m.id, m.message, m.created_at, u.name AS sender_name, u.role AS sender_role
       FROM support_group_messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.group_id = ?
       ORDER BY m.created_at ASC
       LIMIT ?`,
      [groupId, limit]
    );
    return rows;
  }
}

export default SupportGroupMessages;
