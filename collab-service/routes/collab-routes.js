import express from 'express';
import CollabController from '../controller/collab-controller.js';

const router = express.Router();

router.get('/', CollabController.getCollab);

export default router;
