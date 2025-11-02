import { CounselingRequest, AnonymousChat } from "../Models/index.js";
import ConsultsController from "./ConsultsController.js";
import {
  counselingRequestSchema,
  anonStartSchema,
  anonMessageSchema,
} from "../Validator/validation.js";


export async function createCounselingRequest(req, res, next) {
  try {
    const { error, value } = counselingRequestSchema.validate(req.body);
    if (error)
      return res.status(400).json({ error: error.details.map((d) => d.message) });

    const result = await CounselingRequest.create({
      created_by_user_id: req.user.id,
      topic: value.topic,
      details: value.message,
      for_children: value.for_children || false,
      severity: value.severity || "moderate",
      preferred_mode: value.preferred_mode || "chat",
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("createCounselingRequest error:", err);
    next(err);
  }
}


export async function listCounselingRequests(req, res, next) {
  try {
    const status = req.query.status || null;
    const role = req.user.role;
    const rows =
      ["admin", "doctor", "ngo"].includes(role)
        ? await CounselingRequest.listAll(status)
        : await CounselingRequest.listForUser(req.user.id, status);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function assignCounselor(req, res, next) {
  try {
    const counselingId = parseInt(req.params.id, 10);
    if (!counselingId)
      return res.status(400).json({ error: "Counseling ID is required" });

    const body = req.body && typeof req.body === "object" ? req.body : {};

    const counselorId = body.counselorId || req.user.id;

    if (!req.user)
      return res.status(401).json({ error: "Unauthorized - missing user" });

    await CounselingRequest.assignCounselor(counselingId, req.user, counselorId);
    res.status(200).json({ success: true, message: "Counselor assigned successfully" });
  } catch (err) {
    console.error("assignCounselor error:", err);
    res.status(err.status || 500).json({ error: err.message });
  }
}


export async function updateCounselingStatus(req, res, next) {
  try {
    await CounselingRequest.updateStatus(req.params.id, req.user, req.body.status);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}


export async function startAnonSession(req, res, next) {
  try {
    const { error, value } = anonStartSchema.validate(req.body || {});
    if (error)
      return res.status(400).json({ error: error.details.map((d) => d.message) });

    const session = await AnonymousChat.start({
      started_by_user_id: req.user ? req.user.id : null,
      initial_topic: value.initial_message || null,
      for_children: value.for_children || false,
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function postAnonMessage(req, res, next) {
  try {
    const { error, value } = anonMessageSchema.validate(req.body);
    if (error)
      return res.status(400).json({ error: error.details.map((d) => d.message) });

    const { session_token, message } = value;
    const session = await AnonymousChat.getSessionByToken(session_token);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.is_closed)
      return res.status(410).json({ error: "Session closed" });

    const result = await AnonymousChat.sendMessageBySessionId(session.id,"user",message);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAnonMessages(req, res, next) {
  try {
    const token = req.query.session_token;
    if (!token)
      return res.status(400).json({ error: "session_token required" });

    const session = await AnonymousChat.getSessionByToken(token);
    if (!session)
      return res.status(404).json({ error: "session not found" });

    const rows = await AnonymousChat.listMessagesBySessionId(session.id);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function listOpenAnonSessions(req, res, next) {
  try {
    const rows = await AnonymousChat.listOpenSessions();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function assignAnonSession(req, res, next) {
  try {
    await AnonymousChat.assignSession(req.params.id, req.user);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function counselorSendAnonMessage(req, res, next) {
  try {
    const { error, value } = anonMessageSchema.validate(req.body);
    if (error)
      return res.status(400).json({ error: error.details.map((d) => d.message) });

    const session = await AnonymousChat.getSessionByToken(value.session_token);
    if (!session)
      return res.status(404).json({ error: "session not found" });

    await AnonymousChat.counselorSend(session.id, req.user.id, value.message);
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}


export const createOrGetSession = ConsultsController.createOrGetSession;
export const getSession = ConsultsController.getSession;
export const postMessage = ConsultsController.postMessage;
export const listMessages = ConsultsController.listMessages;
export const translateMessage = ConsultsController.translateMessage;

export default {
  createOrGetSession,
  getSession,
  postMessage,
  listMessages,
  translateMessage,
  createCounselingRequest,
  listCounselingRequests,
  assignCounselor,
  updateCounselingStatus,
  startAnonSession,
  postAnonMessage,
  getAnonMessages,
  listOpenAnonSessions,
  assignAnonSession,
  counselorSendAnonMessage,
};
