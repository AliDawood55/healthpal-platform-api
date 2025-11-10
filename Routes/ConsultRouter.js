const router = require('express').Router();
const ctrl = require('../Controllers/ConsultController');
const v = require('../Validator/consultValidation');

// sessions
router.post('/sessions', v.validateCreateSession, ctrl.createSession);
router.get('/sessions/:id', ctrl.getSession);
router.get('/sessions', ctrl.listSessions); // ?appointment_id=&mode=
router.patch('/sessions/:id/start', ctrl.startSession); // sets started_at=NOW()
router.patch('/sessions/:id/end', ctrl.endSession);     // sets ended_at=NOW()

// async messages (low-bandwidth)
router.post('/messages', v.validateCreateMessage, ctrl.createMessage);
router.get('/messages', ctrl.listMessages); // ?appointment_id=

module.exports = router;
