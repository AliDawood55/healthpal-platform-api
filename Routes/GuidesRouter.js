import { Router } from 'express';
import { listGuides, createGuide, updateGuide, deleteGuide } from '../Controllers/GuidesController.js';
import requireRole from '../Middleware/roles.js';

const router = Router();

// GET /api/guides
router.get('/', listGuides);

// POST /api/guides
router.post('/', requireRole(['admin','ngo']), createGuide);

// PUT /api/guides/:id
router.put('/:id', requireRole(['admin','ngo']), updateGuide);

// DELETE /api/guides/:id
router.delete('/:id', requireRole(['admin']), deleteGuide);

export default router;
