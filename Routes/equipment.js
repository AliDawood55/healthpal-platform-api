import express from 'express';
import EquipmentController from '../Controllers/EquipmentController.js';
import auth from '../Middleware/auth.js';

const router = express.Router();

router.get('/items', auth, EquipmentController.getAllEquipment);
router.post('/items', auth, EquipmentController.addEquipment);

router.get('/reservations', auth, EquipmentController.getAllReservations);
router.post('/reservations', auth, EquipmentController.createReservation);
router.put('/reservations/:id', auth, EquipmentController.updateReservationStatus);

export default router;
