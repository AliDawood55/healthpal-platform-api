import { Router } from 'express';
import { listUsers, getUser, createUser, updateUser, deleteUser } from '../Controllers/UsersController.js';

const router = Router();

// GET /api/users
router.get('/', listUsers);

// GET /api/users/:id
router.get('/:id', getUser);

// POST /api/users
router.post('/', createUser);

// PUT /api/users/:id
router.put('/:id', updateUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

export default router;

