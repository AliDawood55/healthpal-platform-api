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
// Patients can see (their) requests, and medical / management roles can browse all
router.get(
  "/requests",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin"]),
  MedicationController.getAllRequests
);

// Create a new medication request (only patients)
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

// List available medication listings
// All authenticated roles can view listings
router.get(
  "/listings",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin", "donor"]),
  MedicationController.getAllListings
);

// Create a new listing
// Donors / NGOs / Admins can publish listings
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
// Everyone involved can see matches
router.get(
  "/matches",
  authenticate,
  authorizeRole(["patient", "doctor", "ngo", "admin", "donor"]),
  MedicationController.getAllMatches
);

// Create a match between a request and a listing
// Typically done by doctor / NGO / admin
router.post(
  "/matches",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  MedicationController.createMatch
);

// Update match status (accepted, completed, cancelled, etc.)
// Also restricted to doctor / NGO / admin
router.put(
  "/matches/:id",
  authenticate,
  authorizeRole(["doctor", "ngo", "admin"]),
  MedicationController.updateMatchStatus
);

export default router;
