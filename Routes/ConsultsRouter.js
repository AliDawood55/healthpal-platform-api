import express from 'express';
const router = express.Router();
import consults from '../Controllers/ConsultsController.js';
import { authenticate } from '../Middleware/auth.js';



router.post('/session', authenticate, consults.createOrGetSession);
router.get('/:appointmentId/session', authenticate, consults.getSession);

router.post('/:appointmentId/message', authenticate, consults.postMessage);
router.get('/:appointmentId/messages', authenticate, consults.listMessages);

router.post('/message/:messageId/translate', authenticate, consults.translateMessage);

export default router;