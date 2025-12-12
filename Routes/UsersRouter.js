import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../Controllers/UsersController.js';

const router = Router();

router.get('/', listUsers);

router.get('/:id', getUser);

router.post('/', createUser);

router.put('/:id', updateUser);


router.delete('/:id', deleteUser);

export default router;
