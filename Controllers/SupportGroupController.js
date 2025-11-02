import {
  supportGroupSchema,
  supportGroupMessageSchema,
} from "../Validator/validation.js";
import SupportGroup from "../Models/SupportGroup.js";

export async function createSupportGroup(req, res, next) {
  try {
    const { error, value } = supportGroupSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });

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
    const joined = await SupportGroup.join(req.params.id, req.user.id);
    if (!joined) return res.status(409).json({ error: "Already a member" });

    res.status(201).json({ success: true, message: "Joined successfully" });
  } catch (err) {
    console.error("joinSupportGroup error:", err);
    next(err);
  }
}

export async function leaveSupportGroup(req, res, next) {
  try {
    const left = await SupportGroup.leave(req.params.id, req.user.id);
    if (!left) return res.status(404).json({ error: "Not a member" });

    res.json({ success: true, message: "Left the group" });
  } catch (err) {
    console.error("leaveSupportGroup error:", err);
    next(err);
  }
}

export async function listGroupMembers(req, res, next) {
  try {
    const members = await SupportGroup.listMembers(req.params.id);
    res.json(members);
  } catch (err) {
    console.error("listGroupMembers error:", err);
    next(err);
  }
}

export async function postSupportGroupMessage(req, res, next) {
  try {
    const { error, value } = supportGroupMessageSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: error.details.map((d) => d.message) });

    const result = await SupportGroup.postMessage(
      req.params.id,
      req.user.id,
      value.message
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: result,
    });
  } catch (err) {
    console.error("postSupportGroupMessage error:", err);
    next(err);
  }
}

export async function listSupportGroupMessages(req, res, next) {
  try {
    const messages = await SupportGroup.listMessages(req.params.id);
    res.json(messages);
  } catch (err) {
    console.error("listSupportGroupMessages error:", err);
    next(err);
  }
}

export default {
  createSupportGroup,
  listSupportGroups,
  joinSupportGroup,
  leaveSupportGroup,
  listGroupMembers,
  postSupportGroupMessage,
  listSupportGroupMessages,
};
