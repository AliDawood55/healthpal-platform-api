import { supportGroupSchema } from "../Validator/validation.js";
import SupportGroup from "../Models/SupportGroup.js";
import SupportGroupMembers from "../Models/SupportGroupMembers.js";


export async function createSupportGroup(req, res, next) {
  try {
    const { error, value } = supportGroupSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });
    }

    const result = await SupportGroup.create({
      title: value.title,
      topic: value.topic,
      description: value.description,
      is_private: value.is_private || false,
      creatorId: req.user.id,
    });

    res.status(201).json({
      message: "Support group created successfully",
      group: result,
    });
  } catch (err) {
    console.error("createSupportGroup error:", err);
    next(err);
  }
}


export async function listSupportGroups(req, res, next) {
  try {
    const rows = await SupportGroup.listAll();
    res.json(rows);
  } catch (err) {
    console.error("listSupportGroups error:", err);
    next(err);
  }
}



export async function joinSupportGroup(req, res, next) {
  try {
    const groupId = req.params.id || req.params.groupId;

    const bodyUserId = req.body && req.body.userId ? Number(req.body.userId) : null;
    const actingUserId = req.user && req.user.id ? Number(req.user.id) : null;

    const userId = bodyUserId || actingUserId;

    if (bodyUserId && bodyUserId !== actingUserId) {
      const allowed = ["admin", "ngo"];
      if (!req.user || !allowed.includes(req.user.role)) {
        return res.status(403).json({ error: "Not authorized to join on behalf of another user" });
      }
    }

    try {
      await SupportGroup.getGroup(groupId);
    } catch (err) {
      return res.status(err.status || 404).json({ error: err.message || 'Group not found' });
    }

    const joined = await SupportGroup.join(groupId, userId);
    if (!joined)
      return res.status(409).json({ error: "Already a member" });

    res.status(201).json({ success: true, message: "Joined successfully" });
  } catch (err) {
    console.error("joinSupportGroup error:", err);
    next(err);
  }
}

export async function leaveSupportGroup(req, res, next) {
  try {
    const groupId = req.params.id || req.params.groupId;

    const bodyUserId = req.body && req.body.userId ? Number(req.body.userId) : null;
    const actingUserId = req.user && req.user.id ? Number(req.user.id) : null;

    const userId = bodyUserId || actingUserId;

    if (bodyUserId && bodyUserId !== actingUserId) {
      const allowed = ["admin", "ngo"];
      if (!req.user || !allowed.includes(req.user.role)) {
        return res.status(403).json({ error: "Not authorized to remove another member" });
      }
    }

    try {
      await SupportGroup.getGroup(groupId);
    } catch (err) {
      return res.status(err.status || 404).json({ error: err.message || 'Group not found' });
    }

    const left = await SupportGroup.leave(groupId, userId);
    if (!left) return res.status(404).json({ error: "Not a member" });

    res.json({ success: true, message: "Left the group" });
  } catch (err) {
    console.error("leaveSupportGroup error:", err);
    next(err);
  }
}


export async function listGroupMembers(req, res, next) {
  try {
    const groupId = req.params.id || req.params.groupId;

    try {
      await SupportGroup.getGroup(groupId);
    } catch (err) {
      return res.status(err.status || 404).json({ error: err.message || 'Group not found' });
    }

    const role = req.user && req.user.role ? req.user.role : 'patient';

    const fullAccess = ['admin', 'doctor', 'ngo'];

    if (!fullAccess.includes(role)) {
      const isMember = await SupportGroupMembers.isMember(groupId, req.user.id);
      if (!isMember) return res.status(403).json({ error: 'Not authorized' });
    }

    const members = await SupportGroup.listMembers(groupId);

    res.json(members);
  } catch (err) {
    console.error("listGroupMembers error:", err);
    next(err);
  }
}

export default {
  createSupportGroup,
  listSupportGroups,
  joinSupportGroup,
  leaveSupportGroup,
  listGroupMembers,
};
