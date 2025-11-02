
import ConsultSession from "../Models/ConsultSession.js";

export async function createOrGetSession(req, res, next) {
  try {
    const { appointment_id, mode = "audio" } = req.body;
    if (!appointment_id)
      return res.status(400).json({ error: "appointment_id is required" });

    const session = await ConsultSession.createOrGet(
      appointment_id,
      mode,
      req.user.id
    );
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function getSession(req, res, next) {
  try {
    const session = await ConsultSession.getByAppointment(req.params.appointmentId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export async function postMessage(req, res, next) {
  try {
    const { message, attachment_url } = req.body;
    if (!message) return res.status(400).json({ error: "message required" });

    const id = await ConsultSession.addMessage(
      req.params.appointmentId,
      req.user.id,
      message,
      attachment_url
    );
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
}

export async function listMessages(req, res, next) {
  try {
    const rows = await ConsultSession.listMessages(req.params.appointmentId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function translateMessage(req, res, next) {
  try {
    const { target_lang, translated_text } = req.body;
    await ConsultSession.translateMessage(
      req.params.messageId,
      req.user.id,
      target_lang,
      translated_text
    );
    res.status(201).json({ success: true });
  } catch (err) {
    next(err);
  }
}

export default {
  createOrGetSession,
  getSession,
  postMessage,
  listMessages,
  translateMessage,
};
