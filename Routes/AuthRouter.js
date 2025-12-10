import express from "express";
import validate from "../Middleware/validate.js";
import authenticate from "../Middleware/authenticate.js";
import authorizeRole from "../Middleware/authorizeRole.js";
import {
  register,
  login,
  getAllUsers,
  getUser,
  editUser,
  removeUser,
  setUserActiveStatus,
} from "../Controllers/AuthController.js";
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
} from "../Validator/userValidation.js";

const router = express.Router();

// ===============================
// Auth Routes
// ===============================

// Register
// Allow anonymous or authenticated (optional) to register
router.post(
  "/register",
  authenticate.optional,
  validate(registerSchema),
  register
);


router.post("/login", validate(loginSchema), login);

// From here on, all routes require authentication
router.use(authenticate);

// ===============================
// User Management (Admin only)
// ===============================
router.get("/users", authorizeRole(["admin"]), getAllUsers);
router.get("/users/:id", authorizeRole(["admin"]), getUser);
router.put(
  "/users/:id",
  authorizeRole(["admin"]),
  validate(updateUserSchema),
  editUser
);
router.delete("/users/:id", authorizeRole(["admin"]), removeUser);
router.patch(
  "/users/:id/active",
  authorizeRole(["admin"]),
  setUserActiveStatus
);

export default router;
