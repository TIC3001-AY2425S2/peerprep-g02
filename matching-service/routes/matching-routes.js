import express from 'express';
import { startMatchmake, cancelMatchmake } from '../controller/matching-controller.js';

const router = express.Router();

router.post('/', startMatchmake);

// Frontend navigator.sendBeacon needs this.
router.post('/cancel/:userId', cancelMatchmake);

export default router;
