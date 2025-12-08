import { Router } from 'express';
import ctrl from '../Controllers/SponsorshipController.js';
import v from '../Validator/sponsorshipValidation.js';

const router = Router();

router.get('/cases', ctrl.listCases);
router.get('/cases/:id', ctrl.getCaseById);
router.post('/cases', v.validateCreateCase, ctrl.createCase);

router.post(
    '/cases/:id/donations',
    v.validateCreateDonation,
    ctrl.createDonation
);
router.get('/cases/:id/donations', ctrl.listCaseDonations);

router.get('/donors/:donorUserId/summary', ctrl.getDonorSummary);

export default router;
