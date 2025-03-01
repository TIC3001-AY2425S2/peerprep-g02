import { isValidObjectId } from 'mongoose';
import {
  createQuestion as _createQuestion,
  deleteQuestionById as _deleteQuestionById,
  findAllQuestions as _findAllQuestions,
  findQuestionById as _findQuestionById,
  findQuestionByTitle as _findQuestionByTitle,
  updateQuestionById as _updateQuestionById,
} from '../model/repository.js';

export async function createQuestion(req, res) {
  try {
    const { title, description, category, complexity } = req.body;
    if (title && description && category && complexity) {
      const existingQuestion = await _findQuestionByTitle(title);
      if (existingQuestion) {
        return res.status(409).json({ message: 'Question already exists' });
      }

      const createdQuestion = await _createQuestion(title, description, category, complexity);
      return res.status(201).json({
        message: `Created new question ${title} successfully`,
        data: createdQuestion,
      });
    } else {
      console.error(res.status);
      return res
        .status(400)
        .json({ message: 'title and/or description and/or category and/or complexity are missing' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when creating new question!' });
  }
}

export async function getQuestion(req, res) {
  try {
    const questionId = req.params.id;
    if (!isValidObjectId(questionId)) {
      return res.status(404).json({ message: `Question ${questionId} not found` });
    }

    const question = await _findQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ message: `Question ${questionId} not found` });
    } else {
      console.error("someone got the question!");
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
    if (!isValidObjectId(questionId)) {
      return res.status(404).json({ message: `Question ${questionId} not found` });
    }

    // only update the fields that are provided
    const updatedQuestion = await _updateQuestionById(questionId, title, description, category, complexity);
    return res.status(200).json({ message: `Updated question ${questionId} successfully`, data: updatedQuestion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when updating question!' });
  }
}

export async function deleteQuestion(req, res) {
  try {
    const questionId = req.params.id;
    if (!isValidObjectId(questionId)) {
      return res.status(404).json({ message: `Question ${questionId} not found` });
    }

    const deletedQuestion = await _deleteQuestionById(questionId);
    return res.status(200).json({ message: `Deleted question ${questionId} successfully`, data: deletedQuestion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Unknown error when deleting question!' });
  }
}
