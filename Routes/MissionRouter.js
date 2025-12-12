import express from 'express';
import authenticate from '../Middleware/authenticate.js';
import authorizeRole from '../Middleware/authorizeRole.js';
import validate from '../Middleware/validate.js';
import {
  ngoSchema,
  missionSchema,
  availabilitySchema,
  requestSchema,
} from '../Validator/validation.js';

import * as NGOController from '../Controllers/NGOController.js';
import * as SurgicalMissionController from '../Controllers/SurgicalMissionController.js';
import * as MissionAvailabilityController from '../Controllers/MissionAvailabilityController.js';
import * as MissionRequestController from '../Controllers/MissionRequestController.js';

const router = express.Router();


router.post('/ngos', authenticate, authorizeRole(['admin']), validate(ngoSchema), NGOController.createNGO);
router.get('/ngos', NGOController.listNGOs);
router.patch('/ngos/:id/verify', authenticate, authorizeRole(['admin']), NGOController.verifyNGO);

router.post('/missions', authenticate, authorizeRole(['admin', 'ngo']), validate(missionSchema), SurgicalMissionController.createMission);
router.get('/missions', SurgicalMissionController.listPublishedMissions);
router.get('/missions/:id', SurgicalMissionController.getMissionDetails);

router.post('/missions/:id/availability', authenticate, authorizeRole(['doctor']), validate(availabilitySchema), MissionAvailabilityController.createAvailability);
router.get('/doctor/me/availability', authenticate, authorizeRole(['doctor']), MissionAvailabilityController.listMyAvailability);

router.post('/availability/:id/requests', authenticate, authorizeRole(['patient']), validate(requestSchema), MissionRequestController.createRequest);
router.get('/availability/:id/requests', authenticate, authorizeRole(['admin', 'ngo']), MissionRequestController.listRequests);
router.patch('/requests/:id/status', authenticate, authorizeRole(['admin', 'ngo']), MissionRequestController.updateRequestStatus);

export default router;

