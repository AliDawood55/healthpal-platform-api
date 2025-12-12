import express from "express";
import MedicationController from "../Controllers/MedicationController.js";
import validate from "../Middleware/validate.js";
import authenticate from "../Middleware/authenticate.js";
import authorizeRole from "../Middleware/authorizeRole.js";
import { createRequestSchema } from "../Validator/medicationValidator.js";

const router = express.Router();

router.get(
  "/requests",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin"]),
  MedicationController.getAllRequests
);

router.post(
  "/requests",
  authenticate,
  authorizeRole(["patient"]),
  validate(createRequestSchema),
  MedicationController.createRequest
);


router.get(
  "/listings",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin", "donor"]),
  MedicationController.getAllListings
);

router.post(
  "/listings",
  authenticate,
  authorizeRole(["donor", "ngo", "admin"]),
  MedicationController.createListing
);


router.get(
  "/matches",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin", "donor"]),
  MedicationController.getAllMatches
);


router.post(
  "/matches",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  MedicationController.createMatch
);

router.put(
  "/matches/:id",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  MedicationController.updateMatchStatus
);

export default router;
