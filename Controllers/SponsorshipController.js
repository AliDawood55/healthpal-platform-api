const SponsorshipCase = require('../Models/SponsorshipCase');
const Donation = require('../Models/Donation');

exports.createCase = async (req, res, next) => {
    try {
        const created = await SponsorshipCase.createCase(req.body);
        res.status(201).json(created);
    } catch (err) {
        next(err);
    }
};

exports.listCases = async (req, res, next) => {
    try {
        const cases = await SponsorshipCase.listCases(req.query);
        res.json(cases);
    } catch (err) {
        next(err);
    }
};

exports.getCaseById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const c = await SponsorshipCase.findById(id);
        if (!c) return res.status(404).json({ message: 'Case not found' });
        const stats = await SponsorshipCase.getCaseStats(id);
        const donations = await Donation.listByCase(id);
        res.json({
        ...c,
        stats,
        donations
        });
    } catch (err) {
        next(err);
    }
};

exports.createDonation = async (req, res, next) => {
    try {
        const caseId = req.params.id;
        const body = req.body;
        const donation = await Donation.createDonation({
        case_id: Number(caseId),
        donor_id: body.donor_id,
        amount: body.amount,
        payment_method: body.payment_method
        });
        await SponsorshipCase.addRaisedAmount(caseId, body.amount);
        res.status(201).json(donation);
    } catch (err) {
        next(err);
    }
};

exports.listCaseDonations = async (req, res, next) => {
    try {
        const caseId = req.params.id;
        const rows = await Donation.listByCase(caseId);
        res.json(rows);
    } catch (err) {
        next(err);
    }
};

exports.getDonorSummary = async (req, res, next) => {
    try {
        const donorUserId = req.params.donorUserId;
        const summary = await Donation.summaryForDonor(donorUserId);
        res.json(summary);
    } catch (err) {
        next(err);
    }
};
