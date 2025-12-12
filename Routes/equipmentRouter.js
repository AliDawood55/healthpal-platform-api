import express from "express";
import EquipmentController from "../Controllers/EquipmentController.js";

import validate from "../Middleware/validate.js";
import authenticate from "../Middleware/authenticate.js";
import authorizeRole from "../Middleware/authorizeRole.js";


const router = express.Router();

router.get(
  "/items",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  EquipmentController.getAllEquipment
);

router.post(
  "/items",
  authenticate,
  authorizeRole(["admin", "ngo"]),
  EquipmentController.addEquipment
);

router.get(
  "/reservations",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  EquipmentController.getAllReservations
);


router.post(
  "/reservations",
  authenticate,
  authorizeRole(["doctor", "ngo"]),
  
  EquipmentController.createReservation
);


router.put(
  "/reservations/:id",
  authenticate,
  authorizeRole(["admin", "ngo"]),
  EquipmentController.updateReservationStatus
);

export default router;
