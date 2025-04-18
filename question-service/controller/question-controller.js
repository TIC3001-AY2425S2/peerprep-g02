import {
  findAllQuestions as _findAllQuestions,
  findDistinctCategory as _findDistinctCategory,
  findDistinctCategoryAndComplexity as _findDistinctCategoryAndComplexity,
  findDistinctComplexity as _findDistinctComplexity,
  findQuestionByTitle as _findQuestionByTitle,
} from '../model/repository.js';
import QuestionService from '../service/QuestionService.js';

export async function createQuestion(req, res) {
  try {
    const { title, description, category, complexity } = req.body;

    const createdQuestion = await QuestionService.createQuestion(title, description, category, complexity);

    return res.status(201).json({
      message: `Created new question ${title} successfully`,
      data: createdQuestion,
    });
  } catch (err) {
    console.error(err);
    if (err.message === 'Question already exists') {
      res.status(409).json({ message: err.message });
    } else if (err.message === 'Missing required fields') {
      res.status(400).json({ message: err.message });
    } else if (err.message === 'QuestionModel validation failed: category: Category cannot be empty.') {
      res.status(400).json({ message: 'Category cannot be empty' });
    } else if (
      err.message === 'Error in rabbitmq create queue' ||
      err.message === 'Error in redis create category complexity set entry'
    ) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: 'Unknown error when creating new question!' });
    }
  }
  return res;
}

export async function getQuestion(req, res) {
  const questionId = req.params.id;
  try {
    const question = await QuestionService.getQuestion(questionId);
    return res.status(200).json({ message: `Found question`, data: question });
  } catch (err) {
    console.error(err);
    if (err.message === `Question not found`) {
      res.status(404).json({ message: `Question ${questionId} not found` });
    } else {
      res.status(500).json({ message: 'Unknown error when getting question!' });
    }
    return res;
  }
}

export async function getRandomQuestionByCategoryAndComplexity(req, res) {
  try {
    const category = req.query.category;
    const complexity = req.query.complexity;

    const question = await QuestionService.getRandomQuestion(category, complexity);
    return res.status(200).json({ message: 'Found a random question', data: question });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when getting random question!' });
  }
}

export async function getQuestionByTitle(req, res) {
  try {
    const questionTitle = req.params.title;
    const question = await _findQuestionByTitle(questionTitle);
    if (!question) {
      return res.status(404).json({ message: `Question ${questionTitle} not found` });
    } else {
      return res.status(200).json({ message: `Found question`, data: question });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when getting question!' });
  }
}

export async function getAllQuestions(req, res) {
  try {
    const questions = await _findAllQuestions();
    return res.status(200).json({ message: 'Found all questions', data: questions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when getting all questions!' });
  }
}

export async function updateQuestion(req, res) {
  try {
    const { title, description, category, complexity } = req.body;
    const questionId = req.params.id;

    // only update the fields that are provided
    const updatedQuestion = await QuestionService.editQuestion(questionId, title, description, category, complexity);
    return res.status(200).json({ message: `Updated question ${questionId} successfully`, data: updatedQuestion });
  } catch (err) {
    console.error(err);
    if (
      err.message === 'Error in rabbitmq create queue' ||
      err.message === 'Error in redis create category complexity set entry'
    ) {
      res.status(500).json({ message: err.message });
    } else if (err.message === 'Validation failed: title: Path `title` is required.') {
      res.status(400).json({ message: 'Title field cannot be empty!' });
    } else if (err.message === 'Validation failed: description: Path `description` is required.') {
      res.status(400).json({ message: 'Description field cannot be empty!' });
    } else if (err.message === 'Validation failed: category: Category cannot be empty.') {
      res.status(400).json({ message: 'Category cannot be empty!' });
    } else if (err.message === 'Question title already exists') {
      res.status(409).json({ message: 'Question title already exists!' });
    } else {
      res.status(500).json({ message: 'Unknown error when updating question!' });
    }
  }
  return res;
}

export async function deleteQuestion(req, res) {
  try {
    const questionId = req.params.id;
    const deletedQuestion = await QuestionService.deleteQuestion(questionId);
    return res.status(200).json({ message: `Deleted question ${questionId} successfully`, data: deletedQuestion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when deleting question!' });
  }
}

export async function getAllCategories(req, res) {
  try {
    const categories = await _findDistinctCategory();
    return res.status(200).json({ data: categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when distinct category!' });
  }
}

export async function getAllComplexities(req, res) {
  try {
    const complexities = await _findDistinctComplexity();
    return res.status(200).json({ data: complexities });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when retrieving distinct complexity!' });
  }
}

export async function getAllCategoryAndComplexityCombination(req, res) {
  try {
    const complexities = await _findDistinctCategoryAndComplexity();
    return res.status(200).json({ data: complexities });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Unknown error when retrieving distinct category and complexity combination!' });
  }
}
