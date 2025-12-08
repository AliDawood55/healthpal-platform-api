import { Router } from 'express';
import ctrl from '../Controllers/ConsultController.js';
import v from '../Validator/consultValidation.js';

const router = Router();

router.post('/sessions', v.validateCreateSession, ctrl.createSession);
router.get('/sessions/:id', ctrl.getSession);
router.get('/sessions', ctrl.listSessions);
router.patch('/sessions/:id/start', ctrl.startSession);
router.patch('/sessions/:id/end', ctrl.endSession);

router.post('/messages', v.validateCreateMessage, ctrl.createMessage);
router.get('/messages', ctrl.listMessages);

export default router;
