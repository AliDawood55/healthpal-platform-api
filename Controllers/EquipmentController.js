import db from '../Config/DBconnection.js';

const EquipmentController = {
  
  async getAllEquipment(req, res) {
    try {
      const [rows] = await db.query('SELECT * FROM equipment_items ORDER BY created_at DESC');
      res.json(rows);
    } catch (err) {
      console.error('Error fetching equipment items:', err);
      res.status(500).json({ message: 'Database error', error: err });
    }
  },

  async addEquipment(req, res) {
    try {
      const { name, category, status } = req.body;
      if (!name) return res.status(400).json({ message: 'Equipment name is required.' });

      const [result] = await db.query(
        'INSERT INTO equipment_items (name, category, status) VALUES (?, ?, ?)',
        [name, category || null, status || 'available']
      );

      res.status(201).json({
        id: result.insertId,
        name,
        category,
        status: status || 'available',
      });
    } catch (err) {
      console.error('Error adding equipment:', err);
      res.status(500).json({ message: 'Database error', error: err });
    }
  },

  async getAllReservations(req, res) {
    try {
      const [rows] = await db.query(`
  SELECT er.*, ei.name AS equipment_name, u.name AS requested_by
  FROM equipment_reservations er
  LEFT JOIN equipment_items ei ON ei.id = er.equipment_id
  LEFT JOIN users u ON u.id = er.requested_by_user_id
  ORDER BY er.created_at DESC
`);
      res.json(rows);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      res.status(500).json({ message: 'Database error', error: err });
    }
  },

  async createReservation(req, res) {
    try {
      const { equipment_id, notes } = req.body;
      const requested_by_user_id = req.user.id;

      if (!equipment_id)
        return res.status(400).json({ message: 'Equipment ID is required.' });

      const [result] = await db.query(
        'INSERT INTO equipment_reservations (equipment_id, requested_by_user_id, status, notes) VALUES (?, ?, "requested", ?)',
        [equipment_id, requested_by_user_id, notes || null]
      );

      res.status(201).json({
        id: result.insertId,
        equipment_id,
        requested_by_user_id,
        status: 'requested',
        notes,
      });
    } catch (err) {
      console.error('Error creating reservation:', err);
      res.status(500).json({ message: 'Database error', error: err });
    }
  },

  async updateReservationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, assigned_to_user_id, notes } = req.body;

      const validStatuses = ['requested', 'approved', 'rejected', 'delivered', 'returned'];
      if (!validStatuses.includes(status))
        return res.status(400).json({ message: 'Invalid status value.' });

      const [result] = await db.query(
        'UPDATE equipment_reservations SET status = ?, assigned_to_user_id = ?, notes = ? WHERE id = ?',
        [status, assigned_to_user_id || null, notes || null, id]
      );

      if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Reservation not found.' });

      res.json({ message: 'Reservation status updated successfully.', status });
    } catch (err) {
      console.error('Error updating reservation status:', err);
      res.status(500).json({ message: 'Database error', error: err });
    }
  },
};

export default EquipmentController;
