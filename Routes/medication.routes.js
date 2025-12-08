import express from 'express';
import MedicationController from '../Controllers/MedicationController.js';
import auth from '../Middleware/auth.js';
import { createRequestSchema } from '../Validator/medicationValidator.js';
import validate from '../Middleware/validate.js';

const router = express.Router();

// ===============================
// Medication Requests
// ===============================
router.get('/requests', auth, MedicationController.getAllRequests);
router.post('/requests', auth, validate(createRequestSchema), MedicationController.createRequest);

// ===============================
// Medication Listings
// ===============================
router.get('/listings', auth, MedicationController.getAllListings);
router.post('/listings', auth, MedicationController.createListing);

// ===============================
// Medication Matches
// ===============================
router.get('/matches', auth, MedicationController.getAllMatches);
router.post('/matches', auth, MedicationController.createMatch);
router.put('/matches/:id', auth, MedicationController.updateMatchStatus);

export default router;
