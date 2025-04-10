import express from 'express';
import {
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
  updateUserPrivilege,
} from '../controller/user-controller.js';
import { verifyIsAdmin, verifyIsOwnerOrAdmin } from '../middleware/basic-access-control.js';

const router = express.Router();

router.get('/', verifyIsAdmin, getAllUsers);

router.patch('/:id/privilege', verifyIsAdmin, updateUserPrivilege);

router.post('/', createUser);

router.get('/:id', verifyIsOwnerOrAdmin, getUser);

router.patch('/:id', verifyIsOwnerOrAdmin, updateUser);

router.delete('/:id', verifyIsOwnerOrAdmin, deleteUser);

export default router;
