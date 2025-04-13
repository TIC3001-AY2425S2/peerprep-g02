import express from 'express';
import { cancelMatchmake, startMatchmake } from '../controller/matching-controller.js';

const router = express.Router();

router.post('/', startMatchmake);

router.post('/cancel', cancelMatchmake);

export default router;
