import pool from "../Config/DBconnection.js";

class SupportGroupMembers {
  static async addMember(groupId, userId) {
    const p = pool.promise();
    const [[exists]] = await p.query(
      `SELECT id FROM support_group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );
    if (exists) return false;
    await p.query(
      `INSERT INTO support_group_members (group_id, user_id, joined_at)
       VALUES (?, ?, NOW())`,
      [groupId, userId]
    );
    return true;
  }

  static async removeMember(groupId, userId) {
    const p = pool.promise();
    const [res] = await p.query(
      `DELETE FROM support_group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );
    return res.affectedRows > 0;
  }

  static async isMember(groupId, userId) {
    const p = pool.promise();
    const [[row]] = await p.query(
      `SELECT id FROM support_group_members WHERE group_id = ? AND user_id = ?`,
      [groupId, userId]
    );
    return !!row;
  }

  static async listMembers(groupId) {
    const p = pool.promise();
    const [rows] = await p.query(
      `SELECT u.id, u.name, u.role, m.joined_at
       FROM support_group_members m
       JOIN users u ON u.id = m.user_id
       WHERE m.group_id = ?`,
      [groupId]
    );
    return rows;
  }
}

export default SupportGroupMembers;
