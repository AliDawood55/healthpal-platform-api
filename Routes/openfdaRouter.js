import express from 'express';
import { searchDrugByName } from '../services/openfdaService.js';

const router = express.Router();

router.get('/search', async (req, res, next) => {
  try {
    const name = (req.query.name || req.query.q || '').toString().trim();
    if (!name) return res.status(400).json({ error: 'Query parameter `name` is required' });
    const limit = Math.min(Math.max(parseInt(req.query.limit || '5', 10), 1), 50);
    const force = (req.query.force || '').toString().toLowerCase() === 'true';
    const results = await searchDrugByName(name, limit, { forceFetch: force });
    res.json({ success: true, count: results.length, results });
  } catch (err) {
    next(err);
  }
});

export default router;
