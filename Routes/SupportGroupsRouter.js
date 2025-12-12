import express from 'express';
import supportController from '../Controllers/SupportGroupController.js';
import authenticate from '../Middleware/authenticate.js';
import validate from '../Middleware/validate.js';
import { joinLeaveMemberSchema } from '../Validator/validation.js';

const router = express.Router();

router.post(
  '/:groupId/join',
  authenticate,
  validate(joinLeaveMemberSchema),
  supportController.joinSupportGroup
);

router.post(
  '/:groupId/leave',
  authenticate,
  validate(joinLeaveMemberSchema),
  supportController.leaveSupportGroup
);

router.get('/:groupId/members', authenticate, supportController.listGroupMembers);

export default router;

