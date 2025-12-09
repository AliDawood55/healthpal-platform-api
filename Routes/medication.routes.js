import express from "express";
import MedicationController from "../Controllers/MedicationController.js";
import validate from "../Middleware/validate.js";
import authenticate from "../Middleware/authenticate.js";
import authorizeRole from "../Middleware/authorizeRole.js";
import { createRequestSchema } from "../Validator/medicationValidator.js";

const router = express.Router();

// ===============================
// Medication Requests
// ===============================

// List requests
// Patients see their requests; medical/admin roles see all
router.get(
  "/requests",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin"]),
  MedicationController.getAllRequests
);

// Create a new medication request (patients only)
router.post(
  "/requests",
  authenticate,
  authorizeRole(["patient"]),
  validate(createRequestSchema),
  MedicationController.createRequest
);

// ===============================
// Medication Listings
// ===============================

// List available listings
router.get(
  "/listings",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin", "donor"]),
  MedicationController.getAllListings
);

// Create a listing (donor/ngo/admin)
router.post(
  "/listings",
  authenticate,
  authorizeRole(["donor", "ngo", "admin"]),
  MedicationController.createListing
);

// ===============================
// Medication Matches
// ===============================

// View matches
router.get(
  "/matches",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin", "donor"]),
  MedicationController.getAllMatches
);

// Create a match (doctor/ngo/admin)
router.post(
  "/matches",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  MedicationController.createMatch
);

// Update a match status (doctor/ngo/admin)
router.put(
  "/matches/:id",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  MedicationController.updateMatchStatus
);

export default router;
