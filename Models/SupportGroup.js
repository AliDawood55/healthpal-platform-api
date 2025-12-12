import pool from "../Config/DBconnection.js";
import SupportGroupMembers from "./SupportGroupMembers.js";

class SupportGroup {

  static async create(data) {
    const p = pool;
    const [ins] = await p.query(
      `INSERT INTO support_groups 
        (title, topic, description, is_private, created_by_user_id, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        data.title,
        data.topic,
        data.description || null,
        data.is_private ? 1 : 0,
        data.creatorId,
      ]
    );

    await SupportGroupMembers.addMember(ins.insertId, data.creatorId);
    await p.query(
      `UPDATE support_group_members 
       SET role = 'moderator' 
       WHERE group_id = ? AND user_id = ?`,
      [ins.insertId, data.creatorId]
    );

    return { id: ins.insertId };
  }

  static async listAll() {
    const p = pool;
    const [rows] = await p.query(
      `SELECT sg.id, sg.title, sg.topic, sg.description, sg.is_private, sg.created_at,
              (SELECT COUNT(*) FROM support_group_members m WHERE m.group_id = sg.id) AS members_count
       FROM support_groups sg
       ORDER BY sg.created_at DESC`
    );
    return rows;
  }

  static async getGroup(groupId) {
    const p = pool;
    const [rows] = await p.query(
      `SELECT id, title, topic, description, is_private, created_at
       FROM support_groups
       WHERE id = ?`,
      [groupId]
    );
    if (!rows[0])
      throw Object.assign(new Error("Group not found"), { status: 404 });

    return rows[0];
  }

  static async join(groupId, userId) {
    return await SupportGroupMembers.addMember(groupId, userId);
  }

  static async leave(groupId, userId) {
    return await SupportGroupMembers.removeMember(groupId, userId);
  }

  static async listMembers(groupId) {
    return await SupportGroupMembers.listMembers(groupId);
  }
}

export default SupportGroup;
