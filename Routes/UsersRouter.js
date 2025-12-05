import { Router } from 'express';
const router = Router();
router.get('/', (_req, res) => res.json({ ok: true, tag: 'users' }));
export default router;
