import SurgicalMission from "../Models/SurgicalMission.js";
import pool from "../Config/DBconnection.js";

function parseDate(input) {
  return new Date(input);
}

async function createMission(req, res, next) {
  try {
    const body = req.body;
    const role = req.user.role;

    // If ngo role, organizer_ngo_id must match req.user.ngo_id (assumption)
    if (role === 'ngo' && !req.user.ngo_id) {
      return res.status(403).json({ error: 'NGO user must have ngo_id in token' });
    }

    const organizerId = body.organizer_ngo_id || (req.user.ngo_id ? req.user.ngo_id : null);
    if (role === 'ngo' && organizerId !== req.user.ngo_id) {
      return res.status(403).json({ error: 'NGO can only create missions for its own organization' });
    }

    // date validation
    const start = parseDate(body.start_date);
    const end = parseDate(body.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid dates' });
    }
    if (start > end) {
      return res.status(400).json({ error: 'start_date must be before or equal to end_date' });
    }

    const data = {
      title: body.title,
      specialty: body.specialty,
      location: body.location,
      country: body.country,
      city: body.city,
      start_date: body.start_date,
      end_date: body.end_date,
      organizer_ngo_id: organizerId,
      description: body.description,
      is_published: body.is_published || false,
    };

    const result = await SurgicalMission.create(data);

    await pool.promise().query(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, NOW())`,
      [req.user.id, 'create_mission', 'surgical_mission', result.id, JSON.stringify({ title: data.title, organizer_ngo_id: data.organizer_ngo_id })]
    );

    res.status(201).json({ id: result.id });
  } catch (err) {
    console.error('createMission error:', err);
    next(err);
  }
}

async function listMissions(req, res, next) {
  try {
    const includeAll = req.query.all === '1' || req.query.all === 'true';
    const rows = await SurgicalMission.listAll(!includeAll);
    res.json(rows);
  } catch (err) {
    console.error('listMissions error:', err);
    next(err);
  }
}

async function listUpcoming(req, res, next) {
  try {
    const rows = await SurgicalMission.listUpcoming();
    res.json(rows);
  } catch (err) {
    console.error('listUpcoming error:', err);
    next(err);
  }
}

async function getMission(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const row = await SurgicalMission.getById(id);
    res.json(row);
  } catch (err) {
    console.error('getMission error:', err);
    next(err);
  }
}

export default {
  createMission,
  listMissions,
  listUpcoming,
  getMission,
};

