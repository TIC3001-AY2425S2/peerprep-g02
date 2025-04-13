import express from 'express';
import {
  createQuestion,
  deleteQuestion,
  getAllCategories,
  getAllCategoryAndComplexityCombination,
  getAllComplexities,
  getAllQuestions,
  getQuestion,
  getQuestionByTitle,
  getRandomQuestionByCategoryAndComplexity,
  updateQuestion,
} from '../controller/question-controller.js';

const router = express.Router();

router.get('/', getAllQuestions);

router.get('/categories', getAllCategories);

router.get('/complexities', getAllComplexities);

router.get('/categories/complexities', getAllCategoryAndComplexityCombination);

router.get('/random', getRandomQuestionByCategoryAndComplexity);

router.post('/', createQuestion);

router.get('/:id', getQuestion);

router.get('/title/:title', getQuestionByTitle);

router.patch('/:id', updateQuestion);

router.delete('/:id', deleteQuestion);

export default router;
