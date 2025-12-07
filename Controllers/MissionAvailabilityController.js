import * as MissionAvailability from '../Models/MissionAvailability.js';
import * as SurgicalMission from '../Models/SurgicalMission.js';

export async function createAvailability(req, res, next) {
  try {
    const missionId = parseInt(req.params.id, 10);
    if (!missionId) return res.status(400).json({ error: 'Invalid mission id in path' });

    // Ensure the referenced mission exists
    const mission = await SurgicalMission.getMissionById(missionId);
    if (!mission) return res.status(404).json({ error: 'Mission not found' });

    const body = req.body || {};

    // Validate datetimes
    const start = new Date(body.start_at);
    const end = new Date(body.end_at);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid start_at or end_at datetime format' });
    }
    if (start >= end) {
      return res.status(400).json({ error: 'start_at must be before end_at' });
    }

    const payload = {
      mission_id: missionId,
      doctor_user_id: req.user.id,
      start_at: body.start_at,
      end_at: body.end_at,
      location: body.location,
      country: body.country || null,
      city: body.city || null,
      capacity: body.capacity || null,
      notes: body.notes || null,
    };

    const result = await MissionAvailability.createAvailability(payload);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listMyAvailability(req, res, next) {
  try {
    const rows = await MissionAvailability.listByDoctor(req.user.id);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export default { createAvailability, listMyAvailability };
