import express from 'express';
import EquipmentController from '../Controllers/EquipmentController.js';
import auth from '../Middleware/auth.js';

const router = express.Router();

// ===============================
// Equipment Items
// ===============================
router.get('/items', auth, EquipmentController.getAllEquipment);
router.post('/items', auth, EquipmentController.addEquipment);

// ===============================
// Equipment Reservations
// ===============================
router.get('/reservations', auth, EquipmentController.getAllReservations);
router.post('/reservations', auth, EquipmentController.createReservation);
router.put('/reservations/:id', auth, EquipmentController.updateReservationStatus);

export default router;
