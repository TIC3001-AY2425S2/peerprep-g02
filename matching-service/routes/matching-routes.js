import express from 'express';

import { startMatchmake } from '../controller/matching-controller.js';

const router = express.Router();

router.post('/', startMatchmake);

export default router;
