import express from 'express';

import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  updateQuestion,
} from '../controller/question-controller.js';

const router = express.Router();

router.get('/', getAllQuestions);

router.post('/', createQuestion);

router.get('/:id', getQuestion);

router.patch('/:id', updateQuestion);

router.delete('/:id', deleteQuestion);

export default router;
