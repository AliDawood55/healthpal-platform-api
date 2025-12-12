import * as SurgicalMission from '../Models/SurgicalMission.js';
import * as NGO from '../Models/NGO.js';

export async function createMission(req, res, next) {
  try {
    const body = req.body || {};

    const { title, specialty, location, start_date, end_date } = body;
    if (!title || !specialty || !location || !start_date || !end_date) {
      return res.status(400).json({ error: 'Missing required fields: title, specialty, location, start_date, end_date' });
    }

    const sd = new Date(start_date);
    const ed = new Date(end_date);
    if (Number.isNaN(sd.getTime()) || Number.isNaN(ed.getTime())) {
      return res.status(400).json({ error: 'Invalid date format for start_date or end_date' });
    }
    if (sd > ed) {
      return res.status(400).json({ error: 'start_date must be before or equal to end_date' });
    }

    const organizerId = body.organizer_ngo_id;
    if (organizerId) {
      const ngo = await NGO.getById(organizerId);
      if (!ngo) return res.status(404).json({ error: 'Organizer NGO not found' });
    }

    const payload = {
      title: body.title,
      specialty: body.specialty,
      location: body.location,
      country: body.country || null,
      city: body.city || null,
      start_date: start_date,
      end_date: end_date,
      organizer_ngo_id: organizerId || null,
      description: body.description || null,
      is_published: typeof body.is_published === 'undefined' ? 1 : (body.is_published ? 1 : 0),
    };

    const result = await SurgicalMission.createMission(payload);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listPublishedMissions(req, res, next) {
  try {
    const rows = await SurgicalMission.listPublishedMissions();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getMissionDetails(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid mission id' });
    const row = await SurgicalMission.getMissionById(id);
    if (!row) return res.status(404).json({ error: 'Mission not found' });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export default { createMission, listPublishedMissions, getMissionDetails };
