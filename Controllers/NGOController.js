import * as NGO from '../Models/NGO.js';

export async function createNGO(req, res, next) {
  try {
    const { name } = req.body;
    const result = await NGO.createNGO(name);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listNGOs(req, res, next) {
  try {
    const rows = await NGO.listVerifiedNGOs();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function verifyNGO(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'Invalid NGO id' });
    await NGO.verifyNGO(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export default { createNGO, listNGOs, verifyNGO };

