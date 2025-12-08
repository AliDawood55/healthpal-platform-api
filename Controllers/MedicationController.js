import db from '../Config/DBconnection.js';

const MedicationController = {
  // ===========================
  // Medication Requests
  // ===========================
  async getAllRequests(req, res) {
    const query = `SELECT * FROM medication_requests ORDER BY created_at DESC`;
    try {
      const [rows] = await db.query(query);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: 'DB error', error: String(err) });
    }
  },

  async createRequest(req, res) {
    const { medication_name, quantity, needed_by } = req.body;
    const patient_id = req.user.id;

    const query = `
      INSERT INTO medication_requests (patient_id, medication_name, quantity, needed_by, status)
      VALUES (?, ?, ?, ?, 'pending')
    `;
    try {
      const [result] = await db.query(query, [patient_id, medication_name, quantity, needed_by || null]);
      res.status(201).json({
        id: result.insertId,
        patient_id,
        medication_name,
        quantity,
        needed_by,
        status: 'pending',
      });
    } catch (err) {
      res.status(500).json({ message: 'DB error', error: String(err) });
    }
  },

  // ===========================
  // Medication Listings
  // ===========================
  async getAllListings(req, res) {
    const query = `SELECT * FROM medication_listings ORDER BY created_at DESC`;
    try {
      const [rows] = await db.query(query);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: 'DB error', error: String(err) });
    }
  },

  async createListing(req, res) {
    const { medication_name, dosage, available_quantity, expires_on } = req.body;
    const listed_by_user_id = req.user.id;

    const query = `
      INSERT INTO medication_listings (listed_by_user_id, medication_name, dosage, available_quantity, expires_on)
      VALUES (?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await db.query(
        query,
        [listed_by_user_id, medication_name, dosage || null, available_quantity, expires_on || null]
      );
      res.status(201).json({
        id: result.insertId,
        listed_by_user_id,
        medication_name,
        dosage,
        available_quantity,
        expires_on,
      });
    } catch (err) {
      res.status(500).json({ message: 'DB error', error: String(err) });
    }
  },

  // ===========================
  // Medication Matches
  // ===========================
  async getAllMatches(req, res) {
    const query = `
      SELECT mm.*, mr.medication_name AS requested_med, ml.medication_name AS listed_med
      FROM medication_matches mm
      JOIN medication_requests mr ON mr.id = mm.request_id
      JOIN medication_listings ml ON ml.id = mm.listing_id
      ORDER BY mm.created_at DESC
    `;
    try {
      const [rows] = await db.query(query);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ message: 'DB error', error: String(err) });
    }
  },

  async createMatch(req, res) {
    const { request_id, listing_id, quantity } = req.body;
    const matched_by_user_id = req.user.id;

    const query = `
      INSERT INTO medication_matches (request_id, listing_id, matched_by_user_id, quantity, status)
      VALUES (?, ?, ?, ?, 'proposed')
    `;
    try {
      const [result] = await db.query(query, [request_id, listing_id, matched_by_user_id, quantity]);
      res.status(201).json({
        id: result.insertId,
        request_id,
        listing_id,
        matched_by_user_id,
        quantity,
        status: 'proposed',
      });
    } catch (err) {
      res.status(500).json({ message: 'DB error', error: String(err) });
    }
  },

  async updateMatchStatus(req, res) {
    const { status } = req.body;
    const { id } = req.params;
    const validStatuses = ['proposed', 'accepted', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const query = `UPDATE medication_matches SET status = ? WHERE id = ?`;
    try {
      const [result] = await db.query(query, [status, id]);
      if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Match not found' });
      res.json({ message: 'Status updated', status });
    } catch (err) {
      return res.status(500).json({ message: 'DB error', error: String(err) });
    }
  },
};

export default MedicationController;
