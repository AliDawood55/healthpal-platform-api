
import express from "express";
import mentalController from "../Controllers/MentalHealthController.js";
import supportController from "../Controllers/SupportGroupController.js";
import validate from "../Middleware/validate.js";
import authenticate from "../Middleware/authenticate.js";
import authorizeRole from "../Middleware/authorizeRole.js";
import {counselingRequestSchema, supportGroupSchema, supportGroupMessageSchema, anonStartSchema, anonMessageSchema,validateCounselorAssignment,} from "../Validator/validation.js";

const router = express.Router();


router.post( "/counseling",authenticate, authorizeRole(["patient"]), validate(counselingRequestSchema), mentalController.createCounselingRequest);
router.get("/counseling", authenticate, authorizeRole(["patient", "doctor", "ngo", "admin"]),mentalController.listCounselingRequests);
router.post("/counseling/:id/assign",authenticate,authorizeRole(["doctor", "admin"]),validateCounselorAssignment,mentalController.assignCounselor);
router.patch( "/counseling/:id/status", authenticate, authorizeRole(["doctor", "admin"]), mentalController.updateCounselingStatus);

router.post("/support-groups", authenticate, authorizeRole(["ngo", "admin"]), validate(supportGroupSchema), supportController.createSupportGroup);
router.get("/support-groups", authenticate,supportController.listSupportGroups);
router.post("/support-groups/:id/join",authenticate,supportController.joinSupportGroup);
router.post("/support-groups/:id/leave",authenticate,supportController.leaveSupportGroup);
router.get("/support-groups/:id/members",authenticate,supportController.listGroupMembers);
router.get("/support-groups/:id/messages",authenticate,supportController.listSupportGroupMessages);
router.post("/support-groups/:id/messages",authenticate,validate(supportGroupMessageSchema),supportController.postSupportGroupMessage);

router.post("/anon/sessions", authenticate, validate(anonStartSchema), mentalController.startAnonSession);
router.post("/anon/sessions/:id/messages", authenticate, validate(anonMessageSchema), mentalController.postAnonMessage);
router.get("/anon/sessions/:id/messages",authenticate,mentalController.getAnonMessages);
router.get("/anon/open-sessions",authenticate,authorizeRole(["ngo", "doctor", "admin"]),mentalController.listOpenAnonSessions);
router.post("/anon/sessions/:id/assign",authenticate,authorizeRole(["doctor", "admin"]),mentalController.assignAnonSession);
router.post("/anon/sessions/:id/counselor-message",authenticate,authorizeRole(["doctor", "admin"]),validate(anonMessageSchema), mentalController.counselorSendAnonMessage);

export default router;
