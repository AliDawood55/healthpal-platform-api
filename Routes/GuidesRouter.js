import { Router } from 'express';
import { listGuides, createGuide, updateGuide, deleteGuide } from '../Controllers/GuidesController.js';
import requireRole from '../Middleware/roles.js';

const router = Router();

router.get('/', listGuides);

router.post('/', requireRole(['admin','ngo']), createGuide);

router.put('/:id', requireRole(['admin','ngo']), updateGuide);

router.delete('/:id', requireRole(['admin']), deleteGuide);

export default router;
