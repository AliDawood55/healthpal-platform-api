import SponsorshipCase from '../Models/SponsorshipCase.js';
import Donation from '../Models/Donation.js';

export const createCase = async (req, res, next) => {
  try {
    const created = await SponsorshipCase.createCase(req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const listCases = async (req, res, next) => {
  try {
    const cases = await SponsorshipCase.listCases(req.query);
    res.json(cases);
  } catch (err) {
    next(err);
  }
};

export const getCaseById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
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


export const createDonation = async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);
    const user = req.user;
    const sponsorshipCase = await SponsorshipCase.findById(caseId);
    if (!sponsorshipCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    const donation = await Donation.createDonation({
      case_id: caseId,
      donor_id: user.id,
      amount: req.body.amount,
      payment_method: req.body.payment_method
    });

    await SponsorshipCase.addRaisedAmount(caseId, req.body.amount);

    res.status(201).json(donation);
  } catch (err) {
    next(err);
  }
};


export const listCaseDonations = async (req, res, next) => {
  try {
    const caseId = Number(req.params.id);
    const user = req.user;

    const sponsorshipCase = await SponsorshipCase.findById(caseId);
    if (!sponsorshipCase) {
      return res.status(404).json({ message: 'Case not found' });
    }

    const allDonations = await Donation.listByCase(caseId);

    if (user.role === 'admin') {
      return res.json(allDonations);
    }

    if (user.role === 'patient') {
      if (user.id !== sponsorshipCase.patient_id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      return res.json(allDonations);
    }

    if (user.role === 'donor') {
      const ownDonations = allDonations.filter(
        (d) => d.donor_id === user.id
      );
      return res.json(ownDonations);
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    next(err);
  }
};


export const getDonorSummary = async (req, res, next) => {
  try {
    const donorUserId = Number(req.params.donorUserId);
    const user = req.user;

    if (user.role !== 'admin' && user.id !== donorUserId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const summary = await Donation.summaryForDonor(donorUserId);
    res.json(summary);
  } catch (err) {
    next(err);
  }
};

export default {
  createCase,
  listCases,
  getCaseById,
  createDonation,
  listCaseDonations,
  getDonorSummary
}
