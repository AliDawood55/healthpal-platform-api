import { Router } from 'express';
import ctrl from '../Controllers/SponsorshipController.js';
import v from '../Validator/sponsorshipValidation.js';
import authenticate from '../Middleware/authenticate.js';
import authorizeRole from '../Middleware/authorizeRole.js';

const router = Router();

router.get('/cases', ctrl.listCases);
router.get('/cases/:id', ctrl.getCaseById);

router.post(
  '/cases',
  authenticate,
  authorizeRole(['admin', 'doctor', 'nurse']),
  v.validateCreateCase,
  ctrl.createCase
);

router.post(
  '/cases/:id/donations',
  authenticate,
  authorizeRole(['donor', 'admin']),
  v.validateCreateDonation,
  ctrl.createDonation
);

router.get(
  '/cases/:id/donations',
  authenticate,
  ctrl.listCaseDonations
);

router.get(
  '/donors/:donorUserId/summary',
  authenticate,
  ctrl.getDonorSummary
);

export default router;
