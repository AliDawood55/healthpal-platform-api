const router = require('express').Router();
const ctrl = require('../Controllers/SponsorshipController');
const v = require('../Validator/sponsorshipValidation');

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

module.exports = router;
