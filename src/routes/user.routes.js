import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { createUser, deleteUser, listUsers, updateUser } from '../controllers/user.controller.js';

const router = Router();

// Account management is for the SEED team only.
router.use(auth, requireRole('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
