import { CounselingRequest } from "../Models/index.js";
import { counselingRequestSchema } from "../Validator/validation.js";

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

    const rows = ["admin", "doctor", "ngo"].includes(role)
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

    const body = req.body ?? {};
    const counselorId = body.counselorId || req.user.id;

    if (!req.user)
      return res.status(401).json({ error: "Unauthorized - missing user" });

    await CounselingRequest.assignCounselor(counselingId, req.user, counselorId);

    res.status(200).json({
      success: true,
      message: "Counselor assigned successfully",
    });
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


export default {
  createCounselingRequest,
  listCounselingRequests,
  assignCounselor,
  updateCounselingStatus,
};
