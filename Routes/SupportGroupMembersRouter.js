import express from 'express';
import supportController from '../Controllers/SupportGroupController.js';
import authenticate from '../Middleware/authenticate.js';
import validate from '../Middleware/validate.js';
import { joinLeaveMemberSchema } from '../Validator/validation.js';

const router = express.Router();

// Join a support group (body: { userId })
router.post(
  '/:groupId/join',
  authenticate,
  validate(joinLeaveMemberSchema),
  supportController.joinSupportGroup
);

// Leave a support group (body: { userId })
router.post(
  '/:groupId/leave',
  authenticate,
  validate(joinLeaveMemberSchema),
  supportController.leaveSupportGroup
);

// List members of a support group
router.get('/:groupId/members', authenticate, supportController.listGroupMembers);

export default router;

