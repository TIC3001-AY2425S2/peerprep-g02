import express from 'express';

import {
  createQuestion,
  deleteQuestion,
  getAllQuestions,
  getQuestion,
  getQuestionByTitle,
  updateQuestion,
} from '../controller/matching-controller.js';

const router = express.Router();

router.get('/', getAllQuestions);

router.post('/', createQuestion);

router.get('/:id', getQuestion);

router.get('/title/:title', getQuestionByTitle);

router.patch('/:id', updateQuestion);

router.delete('/:id', deleteQuestion);

export default router;
