import express from "express";
import EquipmentController from "../Controllers/EquipmentController.js";

import validate from "../Middleware/validate.js";
import authenticate from "../Middleware/authenticate.js";
import authorizeRole from "../Middleware/authorizeRole.js";

// لو عندك Schemas مستقبلاً:
// import { createEquipmentSchema, createReservationSchema } from "../Validator/equipmentValidator.js";

const router = express.Router();

// ===============================
// Equipment Items
// ===============================

// Get all equipment items
// Roles allowed: doctor, ngo, admin
router.get(
  "/items",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  EquipmentController.getAllEquipment
);

// Add new equipment item
// Only admin + NGO can add new equipment
router.post(
  "/items",
  authenticate,
  authorizeRole(["admin", "ngo"]),
  // validate(createEquipmentSchema),
  EquipmentController.addEquipment
);

// ===============================
// Equipment Reservations
// ===============================

// List all reservations
// Doctors / NGO / Admin can see reservations
router.get(
  "/reservations",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  EquipmentController.getAllReservations
);

// Create reservation (example: doctor reserves equipment for a patient)
// Allowed: doctor, ngo
router.post(
  "/reservations",
  authenticate,
  authorizeRole(["doctor", "ngo"]),
  // validate(createReservationSchema),
  EquipmentController.createReservation
);

// Update reservation status (approved, rejected, returned, etc.)
// Allowed only for admin, ngo
router.put(
  "/reservations/:id",
  authenticate,
  authorizeRole(["admin", "ngo"]),
  EquipmentController.updateReservationStatus
);

export default router;
