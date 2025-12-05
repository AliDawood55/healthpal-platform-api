import * as MissionRequest from '../Models/MissionRequest.js';
import * as MissionAvailability from '../Models/MissionAvailability.js';

const ALLOWED_STATUSES = ['requested', 'approved', 'rejected', 'cancelled'];

export async function createRequest(req, res, next) {
  try {
    const availabilityId = parseInt(req.params.id, 10);
    if (!availabilityId) return res.status(400).json({ error: 'Invalid availability id' });

    // ensure availability exists
    const availability = await MissionAvailability.getAvailabilityById(availabilityId);
    if (!availability) return res.status(404).json({ error: 'Availability not found' });

    const notes = req.body.notes || null;
    try {
      const result = await MissionRequest.createRequest({ availability_id: availabilityId, patient_id: req.user.id, notes });
      return res.status(201).json(result);
    } catch (err) {
      // Handle duplicate availability/patient unique constraint
      if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
        return res.status(409).json({ error: 'You have already requested this availability' });
      }
      throw err; // rethrow to outer catch
    }
  } catch (err) {
    next(err);
  }
}

export async function listRequests(req, res, next) {
  try {
    const availabilityId = parseInt(req.params.id, 10);
    if (!availabilityId) return res.status(400).json({ error: 'Invalid availability id' });

    // Optionally could check permissions around NGO ownership; kept simple per requirements
    const rows = await MissionRequest.listByAvailability(availabilityId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function updateRequestStatus(req, res, next) {
  try {
    const requestId = parseInt(req.params.id, 10);
    if (!requestId) return res.status(400).json({ error: 'Invalid request id' });

    const status = (req.body.status || '').toString();
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status, allowed: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const existing = await MissionRequest.getById(requestId);
    if (!existing) return res.status(404).json({ error: 'Request not found' });

    await MissionRequest.updateStatus(requestId, status);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export default { createRequest, listRequests, updateRequestStatus };
